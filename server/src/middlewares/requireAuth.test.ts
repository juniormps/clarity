import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../errors/AppError.js";
import { SESSION_COOKIE_NAME } from "../modules/auth/auth.cookie.js";
import * as authService from "../modules/auth/auth.service.js";
import type { User } from "../modules/users/user.types.js";
import { requireAuth } from "./requireAuth.js";

vi.mock("../modules/auth/auth.service.js", () => ({
    me: vi.fn(),
}));

const mockedMe = vi.mocked(authService.me);

const existingUser: User = {
    id: 7,
    firstName: "Márcio",
    lastName: "Pereira",
    email: "user@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function createRequest(cookies?: Record<string, string>): Request {
    return { cookies: cookies ?? {} } as unknown as Request;
}

describe("requireAuth", () => {
    beforeEach(() => {
        mockedMe.mockReset();
    });

    it("resolve a sessão válida, preenche req.auth.userId e chama next()", async () => {
        mockedMe.mockResolvedValueOnce(existingUser);

        const req = createRequest({ [SESSION_COOKIE_NAME]: "token-valido" });
        const next = vi.fn();

        await requireAuth(req, {} as Response, next as unknown as NextFunction);

        expect(mockedMe).toHaveBeenCalledWith("token-valido");
        expect(req.auth).toEqual({ userId: 7 });
        expect(next).toHaveBeenCalledWith();
    });

    it("rejeita a autenticação quando o cookie sid está ausente", async () => {
        mockedMe.mockRejectedValueOnce(new AppError(401, "Authentication required."));

        const req = createRequest();
        const next = vi.fn();

        await requireAuth(req, {} as Response, next as unknown as NextFunction);

        expect(mockedMe).toHaveBeenCalledWith(undefined);
        expect(next).toHaveBeenCalledTimes(1);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
        expect((error as AppError).message).toBe("Authentication required.");
        expect(req.auth).toBeUndefined();
    });

    it("rejeita com 401 quando o token não corresponde a uma sessão válida", async () => {
        mockedMe.mockRejectedValueOnce(new AppError(401, "Authentication required."));

        const req = createRequest({ [SESSION_COOKIE_NAME]: "token-invalido" });
        const next = vi.fn();

        await requireAuth(req, {} as Response, next as unknown as NextFunction);

        expect(mockedMe).toHaveBeenCalledWith("token-invalido");
        expect(next).toHaveBeenCalledTimes(1);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
        expect(req.auth).toBeUndefined();
    });

    it("trata sessão expirada como sessão inválida", async () => {
        mockedMe.mockRejectedValueOnce(new AppError(401, "Authentication required."));

        const req = createRequest({ [SESSION_COOKIE_NAME]: "token-expirado" });
        const next = vi.fn();

        await requireAuth(req, {} as Response, next as unknown as NextFunction);

        expect(next).toHaveBeenCalledTimes(1);

        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
    });

    it("encaminha erros inesperados para next", async () => {
        const unexpected = new Error("boom");
        mockedMe.mockRejectedValueOnce(unexpected);

        const req = createRequest({ [SESSION_COOKIE_NAME]: "token-valido" });
        const next = vi.fn();

        await requireAuth(req, {} as Response, next as unknown as NextFunction);

        expect(next).toHaveBeenCalledWith(unexpected);
    });
});
