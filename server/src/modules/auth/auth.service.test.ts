import * as argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../errors/AppError.js";
import type { User, UserAuthenticationRecord } from "../users/user.types.js";
import { findByEmailForAuthentication } from "../users/user.repository.js";
import { login, logout, me } from "./auth.service.js";
import {
    createSession,
    deleteExpiredSessions,
    deleteSessionByTokenHash,
    findUserByTokenHash,
} from "./session.repository.js";
import { hashSessionToken } from "./session.token.js";

vi.mock("../users/user.repository.js", () => ({
    findByEmailForAuthentication: vi.fn(),
}));

vi.mock("./session.repository.js", () => ({
    createSession: vi.fn(),
    deleteExpiredSessions: vi.fn(),
    findUserByTokenHash: vi.fn(),
    deleteSessionByTokenHash: vi.fn(),
}));

const mockedFindByEmailForAuthentication = vi.mocked(findByEmailForAuthentication);
const mockedCreateSession = vi.mocked(createSession);
const mockedDeleteExpiredSessions = vi.mocked(deleteExpiredSessions);
const mockedFindUserByTokenHash = vi.mocked(findUserByTokenHash);
const mockedDeleteSessionByTokenHash = vi.mocked(deleteSessionByTokenHash);

const existingUser: User = {
    id: 1,
    firstName: "Márcio",
    lastName: "Pereira",
    email: "user@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("login", () => {
    beforeEach(() => {
        mockedFindByEmailForAuthentication.mockReset();
        mockedCreateSession.mockReset();
        mockedDeleteExpiredSessions.mockReset();
    });

    it("lança AppError 400 quando a validação falha", async () => {
        const promise = login({});

        await expect(promise).rejects.toBeInstanceOf(AppError);

        try {
            await promise;
        } catch (error) {
            expect((error as AppError).statusCode).toBe(400);
        }

        expect(mockedFindByEmailForAuthentication).not.toHaveBeenCalled();
        expect(mockedCreateSession).not.toHaveBeenCalled();
        expect(mockedDeleteExpiredSessions).not.toHaveBeenCalled();
    });

    it("lança AppError 401 quando o email não existe", async () => {
        mockedFindByEmailForAuthentication.mockResolvedValueOnce(null);

        const promise = login({ email: "user@example.com", password: "senha" });

        await expect(promise).rejects.toBeInstanceOf(AppError);

        try {
            await promise;
        } catch (error) {
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe("Invalid email or password.");
        }

        expect(mockedCreateSession).not.toHaveBeenCalled();
        expect(mockedDeleteExpiredSessions).not.toHaveBeenCalled();
    });

    it("lança AppError 401 quando a senha está incorreta", async () => {
        const passwordHash = await argon2.hash("senha-correta");
        const authUser: UserAuthenticationRecord = { ...existingUser, passwordHash };
        mockedFindByEmailForAuthentication.mockResolvedValueOnce(authUser);

        const promise = login({ email: "user@example.com", password: "senha-errada" });

        await expect(promise).rejects.toBeInstanceOf(AppError);

        try {
            await promise;
        } catch (error) {
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe("Invalid email or password.");
        }

        expect(mockedCreateSession).not.toHaveBeenCalled();
        expect(mockedDeleteExpiredSessions).not.toHaveBeenCalled();
    });

    it("autentica, cria a sessão e retorna usuário seguro + token", async () => {
        const passwordHash = await argon2.hash("senha-segura");
        const authUser: UserAuthenticationRecord = { ...existingUser, passwordHash };
        mockedFindByEmailForAuthentication.mockResolvedValueOnce(authUser);
        mockedCreateSession.mockResolvedValueOnce(undefined);

        const result = await login({ email: "user@example.com", password: "senha-segura" });

        expect(result.user).toEqual(existingUser);
        expect(result.user).not.toHaveProperty("passwordHash");
        expect(result.user).not.toHaveProperty("password");
        expect(result.token).toBeTruthy();

        expect(mockedCreateSession).toHaveBeenCalledTimes(1);
        expect(mockedDeleteExpiredSessions).toHaveBeenCalledTimes(1);

        const cleanupCallOrder = mockedDeleteExpiredSessions.mock.invocationCallOrder[0];
        const createSessionCallOrder = mockedCreateSession.mock.invocationCallOrder[0];

        expect(cleanupCallOrder).toBeLessThan(createSessionCallOrder);

        const sessionInput = mockedCreateSession.mock.calls[0][0];

        expect(sessionInput.userId).toBe(existingUser.id);
        expect(sessionInput.tokenHash).not.toBe(result.token);
        expect(sessionInput.tokenHash).toMatch(/^[0-9a-f]{64}$/);
        expect(sessionInput.tokenHash).toBe(hashSessionToken(result.token));

        const expiresAt = sessionInput.expiresAt;
        const remaining = expiresAt.getTime() - Date.now();

        expect(remaining).toBeGreaterThan(23 * 60 * 60 * 1000);
        expect(remaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });
});

describe("me", () => {
    beforeEach(() => {
        mockedFindUserByTokenHash.mockReset();
    });

    it("lança AppError 401 quando o token está ausente", async () => {
        await expect(me(undefined)).rejects.toMatchObject({
            statusCode: 401,
            message: "Authentication required.",
        });

        expect(mockedFindUserByTokenHash).not.toHaveBeenCalled();
    });

    it("lança AppError 401 quando o token não corresponde a uma sessão válida", async () => {
        mockedFindUserByTokenHash.mockResolvedValueOnce(null);

        await expect(me("token-desconhecido")).rejects.toMatchObject({
            statusCode: 401,
            message: "Authentication required.",
        });

        expect(mockedFindUserByTokenHash).toHaveBeenCalledWith(
            hashSessionToken("token-desconhecido"),
        );
    });

    it("retorna o usuário da sessão válida", async () => {
        mockedFindUserByTokenHash.mockResolvedValueOnce(existingUser);

        await expect(me("token-valido")).resolves.toEqual(existingUser);

        expect(mockedFindUserByTokenHash).toHaveBeenCalledWith(hashSessionToken("token-valido"));
    });
});

describe("logout", () => {
    beforeEach(() => {
        mockedDeleteSessionByTokenHash.mockReset();
    });

    it("remove a sessão pelo hash do token", async () => {
        mockedDeleteSessionByTokenHash.mockResolvedValueOnce(undefined);

        await logout("token-valido");

        expect(mockedDeleteSessionByTokenHash).toHaveBeenCalledWith(
            hashSessionToken("token-valido"),
        );
    });

    it("não falha quando o token está ausente", async () => {
        await expect(logout(undefined)).resolves.toBeUndefined();

        expect(mockedDeleteSessionByTokenHash).not.toHaveBeenCalled();
    });

    it("não envia o token real ao repository", async () => {
        mockedDeleteSessionByTokenHash.mockResolvedValueOnce(undefined);

        await logout("token-secreto");

        const tokenHash = mockedDeleteSessionByTokenHash.mock.calls[0][0];

        expect(tokenHash).not.toBe("token-secreto");
        expect(tokenHash).toBe(hashSessionToken("token-secreto"));
    });
});
