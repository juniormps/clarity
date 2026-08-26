import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../errors/AppError.js";
import { errorHandler } from "./errorHandler.js";

function createMockResponse() {
    const res = {
        headersSent: false,
        statusCode: 0,
        json: vi.fn(),
        status(code: number) {
            res.statusCode = code;
            return res;
        },
    };

    return res as unknown as Response;
}

describe("errorHandler", () => {
    it("responde com o status e { error: message } de um AppError", () => {
        const res = createMockResponse();
        const next = vi.fn();
        const error = new AppError(400, "Bad request");

        errorHandler(error, {} as Request, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Bad request" });
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 500 com mensagem genérica para erros inesperados", () => {
        const res = createMockResponse();
        const next = vi.fn();
        const error = new Error("boom");

        errorHandler(error, {} as Request, res, next);

        expect(res.statusCode).toBe(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal server error." });
        expect(next).not.toHaveBeenCalled();
    });

    it("delega para next quando headersSent é true", () => {
        const res = createMockResponse();
        res.headersSent = true;
        const next = vi.fn();
        const error = new Error("boom");

        errorHandler(error, {} as Request, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });

    it("responde 400 para JSON malformado (erro do body-parser)", () => {
        const res = createMockResponse();
        const next = vi.fn();
        const error = Object.assign(new SyntaxError("Unexpected token"), {
            type: "entity.parse.failed",
        });

        errorHandler(error, {} as Request, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid JSON payload." });
        expect(next).not.toHaveBeenCalled();
    });

    it("responde 413 para payload excessivo (erro do body-parser)", () => {
        const res = createMockResponse();
        const next = vi.fn();
        const error = Object.assign(new Error("request entity too large"), {
            type: "entity.too.large",
        });

        errorHandler(error, {} as Request, res, next);

        expect(res.statusCode).toBe(413);
        expect(res.json).toHaveBeenCalledWith({ error: "Payload too large." });
        expect(next).not.toHaveBeenCalled();
    });
});
