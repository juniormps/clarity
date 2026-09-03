import { createHash, randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { pool } from "../../src/database/connection.js";
import { resetRateLimits } from "../../src/middlewares/rateLimiters.js";

interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

const PASSWORD = "senha-teste-123";

const createdEmails: string[] = [];

async function deleteUsersByEmail(emails: string[]): Promise<void> {
    for (const email of emails) {
        await pool.execute("DELETE FROM users WHERE email = ?", [email]);
    }
}

async function registerUser(email: string): Promise<UserResponse> {
    const response = await request(app)
        .post("/api/users")
        .send({
            firstName: "Limpeza",
            lastName: "Sessão",
            email,
            password: PASSWORD,
            passwordConfirmation: PASSWORD,
        });

    expect(response.status).toBe(201);

    return response.body.data as UserResponse;
}

//Gera um hash de token SHA-256 (64 caracteres hexadecimais) único por chamada,
//adequado à coluna token_hash CHAR(64) e sem risco de colisão entre execuções.
function makeTokenHash(): string {
    return createHash("sha256").update(`session-cleanup-${randomUUID()}`).digest("hex");
}

async function sessionExists(tokenHash: string): Promise<boolean> {
    const [rows] = await pool.execute(
        "SELECT id FROM sessions WHERE token_hash = ?",
        [tokenHash],
    );

    return (rows as unknown[]).length > 0;
}

async function listTokenHashesByUserId(userId: number): Promise<string[]> {
    const [rows] = await pool.execute<{ token_hash: string }[]>(
        "SELECT token_hash FROM sessions WHERE user_id = ?",
        [userId],
    );

    return rows.map((row) => row.token_hash);
}

afterAll(async () => {
    await deleteUsersByEmail([...createdEmails]);
    await pool.end();
});

describe("limpeza de sessões expiradas no fluxo real de login", () => {
    let userIdA: number;
    let userIdB: number;
    let emailA: string;
    let emailB: string;

    let expiredHashA: string;
    let validHashA: string;
    let validHashB: string;

    beforeEach(async () => {
        await resetRateLimits();

        const suffix = randomUUID();
        emailA = `cleanup-a-${suffix}@example.com`;
        emailB = `cleanup-b-${suffix}@example.com`;

        createdEmails.push(emailA, emailB);

        const userA = await registerUser(emailA);
        const userB = await registerUser(emailB);

        userIdA = userA.id;
        userIdB = userB.id;

        expiredHashA = makeTokenHash();
        validHashA = makeTokenHash();
        validHashB = makeTokenHash();

        await pool.execute(
            "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))",
            [userIdA, expiredHashA],
        );

        await pool.execute(
            "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))",
            [userIdA, validHashA],
        );

        await pool.execute(
            "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))",
            [userIdB, validHashB],
        );
    });

    afterEach(async () => {
        await deleteUsersByEmail(createdEmails.splice(0));
    });

    it("remove apenas a sessão expirada e preserva as sessões válidas após o login", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: emailA, password: PASSWORD });

        expect(loginResponse.status).toBe(200);

        const cookies = loginResponse.headers["set-cookie"] as unknown as string[];
        const sessionCookie = cookies.find((cookie) => cookie.startsWith("sid="));

        expect(sessionCookie).toBeDefined();

        const token = sessionCookie!.split(";")[0].split("sid=")[1];
        const loginTokenHash = createHash("sha256").update(token).digest("hex");

        expect(await sessionExists(expiredHashA)).toBe(false);
        expect(await sessionExists(validHashA)).toBe(true);
        expect(await sessionExists(validHashB)).toBe(true);

        const hashesA = await listTokenHashesByUserId(userIdA);
        expect(hashesA).toHaveLength(2);
        expect(hashesA).toContain(validHashA);
        expect(hashesA).toContain(loginTokenHash);

        const hashesB = await listTokenHashesByUserId(userIdB);
        expect(hashesB).toHaveLength(1);
        expect(hashesB).toContain(validHashB);
    });
});
