import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { create } from "./user.controller.js";
import { createUser } from "./user.service.js";
import type { User } from "./user.types.js";

vi.mock("./user.service.js", () => ({
    createUser: vi.fn(),
}));

const mockedCreateUser = vi.mocked(createUser);

function createMockResponse() {
    const res = {
        statusCode: 0,
        json: vi.fn(),
        status(code: number) {
            res.statusCode = code;
            return res;
        },
    };

    return res as unknown as Response;
}

const existingUser: User = {
    id: 1,
    firstName: "Márcio",
    lastName: "Pereira",
    email: "user@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("userController.create", () => {
    it("responde 201 com { data: user } em caso de sucesso", async () => {
        mockedCreateUser.mockResolvedValueOnce(existingUser);

        const req = {
            body: {
                firstName: "Márcio",
                lastName: "Pereira",
                email: "user@example.com",
                password: "senha-segura",
                passwordConfirmation: "senha-segura",
            },
        } as Request;
        const res = createMockResponse();
        const next = vi.fn();

        await create(req, res, next);

        expect(res.statusCode).toBe(201);
        expect(res.json).toHaveBeenCalledWith({ data: existingUser });
        expect(next).not.toHaveBeenCalled();
    });

    it("encaminha o erro para next", async () => {
        const error = new Error("boom");
        mockedCreateUser.mockRejectedValueOnce(error);

        const req = { body: {} } as Request;
        const res = createMockResponse();
        const next = vi.fn() as unknown as NextFunction;

        await create(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});
