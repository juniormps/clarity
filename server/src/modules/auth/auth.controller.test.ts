import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { User } from "../users/user.types.js";
import { SESSION_COOKIE_NAME } from "./auth.cookie.js";
import { login, logout, me } from "./auth.controller.js";
import * as authService from "./auth.service.js";

vi.mock("./auth.service.js", () => ({
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
}));

const mockedLogin = vi.mocked(authService.login);
const mockedLogout = vi.mocked(authService.logout);
const mockedMe = vi.mocked(authService.me);

const existingUser: User = {
    id: 1,
    firstName: "Márcio",
    lastName: "Pereira",
    email: "user@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function createMockResponse() {
    const json = vi.fn();
    const cookie = vi.fn();
    const clearCookie = vi.fn();
    const end = vi.fn();

    const res = {
        statusCode: 0,
        json,
        cookie,
        clearCookie,
        end,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
    };

    return { res: res as unknown as Response, json, cookie, clearCookie, end };
}

describe("authController.login", () => {
    it("responde 200, define o cookie e retorna { data: user } sem o token", async () => {
        mockedLogin.mockResolvedValueOnce({ user: existingUser, token: "token-secreto" });

        const req = {
            body: { email: "user@example.com", password: "senha" },
        } as Request;
        const { res, cookie, json } = createMockResponse();
        const next = vi.fn();

        await login(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(cookie).toHaveBeenCalledWith(
            SESSION_COOKIE_NAME,
            "token-secreto",
            expect.objectContaining({
                httpOnly: true,
                sameSite: "lax",
                path: "/",
            }),
        );
        expect(json).toHaveBeenCalledWith({ data: existingUser });
        expect(JSON.stringify(json.mock.calls[0][0])).not.toContain("token-secreto");
        expect(next).not.toHaveBeenCalled();
    });

    it("encaminha o erro para next", async () => {
        const error = new Error("boom");
        mockedLogin.mockRejectedValueOnce(error);

        const req = { body: {} } as Request;
        const { res, json } = createMockResponse();
        const next = vi.fn() as unknown as NextFunction;

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(json).not.toHaveBeenCalled();
    });
});

describe("authController.me", () => {
    it("responde 200 com { data: user } para sessão válida", async () => {
        mockedMe.mockResolvedValueOnce(existingUser);

        const req = { cookies: { [SESSION_COOKIE_NAME]: "token" } } as unknown as Request;
        const { res, json } = createMockResponse();
        const next = vi.fn();

        await me(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(json).toHaveBeenCalledWith({ data: existingUser });
        expect(mockedMe).toHaveBeenCalledWith("token");
        expect(next).not.toHaveBeenCalled();
    });

    it("encaminha o erro para next", async () => {
        const error = new Error("boom");
        mockedMe.mockRejectedValueOnce(error);

        const req = { cookies: { [SESSION_COOKIE_NAME]: "token" } } as unknown as Request;
        const { res, json } = createMockResponse();
        const next = vi.fn() as unknown as NextFunction;

        await me(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(json).not.toHaveBeenCalled();
    });
});

describe("authController.logout", () => {
    it("limpa o cookie e responde 204 sem body", async () => {
        mockedLogout.mockResolvedValueOnce(undefined);

        const req = { cookies: { [SESSION_COOKIE_NAME]: "token" } } as unknown as Request;
        const { res, clearCookie, end, json } = createMockResponse();
        const next = vi.fn();

        await logout(req, res, next);

        expect(clearCookie).toHaveBeenCalledWith(
            SESSION_COOKIE_NAME,
            expect.objectContaining({
                sameSite: "lax",
                path: "/",
            }),
        );
        expect(res.statusCode).toBe(204);
        expect(end).toHaveBeenCalled();
        expect(json).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("encaminha o erro para next", async () => {
        const error = new Error("boom");
        mockedLogout.mockRejectedValueOnce(error);

        const req = { cookies: { [SESSION_COOKIE_NAME]: "token" } } as unknown as Request;
        const { res } = createMockResponse();
        const next = vi.fn() as unknown as NextFunction;

        await logout(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
