import { describe, expect, it } from "vitest";
import { validateLoginInput } from "./auth.validation.js";

function validBody(overrides: Record<string, unknown> = {}) {
    return {
        email: "user@example.com",
        password: "senha",
        ...overrides,
    };
}

function missing(field: "email" | "password") {
    const body = validBody() as Record<string, unknown>;
    delete body[field];
    return body;
}

describe("validateLoginInput - body", () => {
    it("rejeita body ausente ou null", () => {
        expect(validateLoginInput(undefined)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
        expect(validateLoginInput(null)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
    });

    it("rejeita body que não seja um objeto JSON", () => {
        expect(validateLoginInput("texto")).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
        expect(validateLoginInput([])).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
    });
});

describe("validateLoginInput - email", () => {
    it("rejeita email ausente", () => {
        expect(validateLoginInput(missing("email"))).toEqual({
            valid: false,
            error: '"email" is required.',
        });
    });

    it("rejeita email que não seja string", () => {
        expect(validateLoginInput(validBody({ email: 42 }))).toEqual({
            valid: false,
            error: '"email" must be a string.',
        });
    });

    it("rejeita email vazio", () => {
        expect(validateLoginInput(validBody({ email: "" }))).toEqual({
            valid: false,
            error: '"email" cannot be empty.',
        });
    });

    it("rejeita email com formato inválido", () => {
        expect(validateLoginInput(validBody({ email: "not-an-email" }))).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
        expect(validateLoginInput(validBody({ email: "user@" }))).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
    });

    it("rejeita email acima de 255 caracteres", () => {
        const longEmail = `${"a".repeat(250)}@example.com`;

        expect(validateLoginInput(validBody({ email: longEmail }))).toEqual({
            valid: false,
            error: '"email" must be at most 255 characters.',
        });
    });

    it("normaliza email com trim e lowercase", () => {
        expect(validateLoginInput(validBody({ email: "  User@Example.COM  " }))).toEqual({
            valid: true,
            data: {
                email: "user@example.com",
                password: "senha",
            },
        });
    });

    it("aceita email válido", () => {
        expect(validateLoginInput(validBody())).toEqual({
            valid: true,
            data: {
                email: "user@example.com",
                password: "senha",
            },
        });
    });
});

describe("validateLoginInput - password", () => {
    it("rejeita password ausente", () => {
        expect(validateLoginInput(missing("password"))).toEqual({
            valid: false,
            error: '"password" is required.',
        });
    });

    it("rejeita password que não seja string", () => {
        expect(validateLoginInput(validBody({ password: 42 }))).toEqual({
            valid: false,
            error: '"password" must be a string.',
        });
    });

    it("rejeita password vazia", () => {
        expect(validateLoginInput(validBody({ password: "" }))).toEqual({
            valid: false,
            error: '"password" cannot be empty.',
        });
    });

    it("rejeita password acima de 128 caracteres", () => {
        expect(validateLoginInput(validBody({ password: "a".repeat(129) }))).toEqual({
            valid: false,
            error: '"password" must be at most 128 characters.',
        });
    });

    it("preserva exatamente o conteúdo da senha, sem trim", () => {
        expect(validateLoginInput(validBody({ password: " senha " }))).toEqual({
            valid: true,
            data: {
                email: "user@example.com",
                password: " senha ",
            },
        });
    });

    it("aceita password válida", () => {
        expect(validateLoginInput(validBody())).toEqual({
            valid: true,
            data: {
                email: "user@example.com",
                password: "senha",
            },
        });
    });
});
