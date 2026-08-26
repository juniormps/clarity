import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { pool } from "../../src/database/connection.js";
import { resetRateLimits } from "../../src/middlewares/rateLimiters.js";
import { SESSION_TTL_MS } from "../../src/modules/auth/auth.cookie.js";

const PASSWORD = "senha-segura-123";

const createdEmails: string[] = [];

async function registerUser(email: string): Promise<void> {
    const response = await request(app).post("/api/users").send({
        firstName: "Segurança",
        lastName: "Teste",
        email,
        password: PASSWORD,
        passwordConfirmation: PASSWORD,
    });

    expect(response.status).toBe(201);
}

afterAll(async () => {
    for (const email of createdEmails) {
        await pool.execute("DELETE FROM users WHERE email = ?", [email]);
    }
    await pool.end();
});

beforeEach(async () => {
    await resetRateLimits();
});

describe("headers de segurança", () => {
    it("aplica headers do Helmet e remove o X-Powered-By", async () => {
        const response = await request(app).get("/api/nao-existe");

        expect(response.headers["x-powered-by"]).toBeUndefined();
        expect(response.headers["content-security-policy"]).toBeDefined();
        expect(response.headers["x-content-type-options"]).toBe("nosniff");
        expect(response.headers["x-frame-options"]).toBeDefined();
        expect(response.headers["referrer-policy"]).toBeDefined();
    });

    it("retorna JSON 404 para rota de API inexistente", async () => {
        const response = await request(app).get("/api/nao-existe");

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body).toEqual({ error: "Not found." });
    });
});

describe("limites de payload", () => {
    it("retorna 400 para JSON malformado", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .set("Content-Type", "application/json")
            .send('{"email": "a", "password": "b"');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid JSON payload." });
    });

    it("retorna 413 para payload acima do limite", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .set("Content-Type", "application/json")
            .send(JSON.stringify({ email: "a@b.com", password: "x".repeat(20000) }));

        expect(response.status).toBe(413);
        expect(response.body).toEqual({ error: "Payload too large." });
    });
});

describe("cookie de sessão", () => {
    it("define cookie HttpOnly, SameSite=Lax, Path=/ e Max-Age de 24h no login", async () => {
        const email = `sec-${randomUUID()}@example.com`;
        createdEmails.push(email);
        await registerUser(email);

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email, password: PASSWORD });

        expect(response.status).toBe(200);

        const cookies = response.headers["set-cookie"] as unknown as string[];
        const sessionCookie = cookies.find((cookie) => cookie.startsWith("sid="));

        expect(sessionCookie).toBeDefined();
        expect(sessionCookie).toContain("HttpOnly");
        expect(sessionCookie).toContain("SameSite=Lax");
        expect(sessionCookie).toContain("Path=/");
        expect(sessionCookie).toContain(`Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`);
        expect(sessionCookie).not.toContain("Secure");
    });

    it("limpa o cookie no logout sem redefinir Max-Age", async () => {
        const email = `sec-${randomUUID()}@example.com`;
        createdEmails.push(email);
        await registerUser(email);

        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({ email, password: PASSWORD });
        expect(loginResponse.status).toBe(200);

        const logoutResponse = await agent.post("/api/auth/logout");
        expect(logoutResponse.status).toBe(204);

        const cookies = logoutResponse.headers["set-cookie"] as unknown as string[];
        const clearedCookie = cookies.find((cookie) => cookie.startsWith("sid="));

        expect(clearedCookie).toBeDefined();
        expect(clearedCookie).toContain("HttpOnly");
        expect(clearedCookie).toContain("SameSite=Lax");
        expect(clearedCookie).toContain("Path=/");
        expect(clearedCookie).toContain("Expires=");
        expect(clearedCookie).not.toContain("Max-Age=");
    });
});

describe("rate limiting nos endpoints reais", () => {
    it("bloqueia tentativas excessivas de login com 429", async () => {
        const credentials = { email: "nao-existe@example.com", password: "senha-errada" };

        for (let i = 0; i < 10; i++) {
            const response = await request(app).post("/api/auth/login").send(credentials);
            expect(response.status).toBe(401);
        }

        const blocked = await request(app).post("/api/auth/login").send(credentials);

        expect(blocked.status).toBe(429);
        expect(blocked.body).toEqual({ error: "Too many requests. Please try again later." });
    });

    it("bloqueia cadastros excessivos com 429 sem criar usuários", async () => {
        for (let i = 0; i < 5; i++) {
            const response = await request(app).post("/api/users").send({});
            expect(response.status).toBe(400);
        }

        const blocked = await request(app).post("/api/users").send({});

        expect(blocked.status).toBe(429);
        expect(blocked.body).toEqual({ error: "Too many requests. Please try again later." });
    });
});
