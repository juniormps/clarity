import { describe, expect, it } from "vitest";
import { validateCreateUserInput } from "./user.validation.js";

describe("validateCreateUserInput - body", () => {
    it("rejeita body ausente ou null", () => {
        expect(validateCreateUserInput(undefined)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
        expect(validateCreateUserInput(null)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
    });

    it("rejeita body que não seja um objeto JSON", () => {
        expect(validateCreateUserInput("texto")).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
        expect(validateCreateUserInput([])).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
    });
});

describe("validateCreateUserInput - name", () => {
    it("rejeita name ausente", () => {
        expect(validateCreateUserInput({ email: "a@b.com", password: "12345678" })).toEqual({
            valid: false,
            error: '"name" is required.',
        });
    });

    it("rejeita name que não seja string", () => {
        expect(validateCreateUserInput({ name: 42, email: "a@b.com", password: "12345678" })).toEqual({
            valid: false,
            error: '"name" must be a string.',
        });
    });

    it("rejeita name vazio ou apenas com espaços", () => {
        expect(validateCreateUserInput({ name: "", email: "a@b.com", password: "12345678" })).toEqual({
            valid: false,
            error: '"name" cannot be empty.',
        });
        expect(validateCreateUserInput({ name: "   ", email: "a@b.com", password: "12345678" })).toEqual({
            valid: false,
            error: '"name" cannot be empty.',
        });
    });

    it("rejeita name acima de 120 caracteres", () => {
        expect(validateCreateUserInput({ name: "a".repeat(121), email: "a@b.com", password: "12345678" })).toEqual({
            valid: false,
            error: '"name" must be at most 120 characters.',
        });
    });

    it("aceita name válido e remove espaços das extremidades", () => {
        expect(
            validateCreateUserInput({ name: "  Márcio Júnior  ", email: "a@b.com", password: "12345678" }),
        ).toEqual({
            valid: true,
            data: { name: "Márcio Júnior", email: "a@b.com", password: "12345678" },
        });
    });
});

describe("validateCreateUserInput - email", () => {
    it("rejeita email ausente", () => {
        expect(validateCreateUserInput({ name: "Márcio", password: "12345678" })).toEqual({
            valid: false,
            error: '"email" is required.',
        });
    });

    it("rejeita email que não seja string", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: 42, password: "12345678" })).toEqual({
            valid: false,
            error: '"email" must be a string.',
        });
    });

    it("rejeita email vazio", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "", password: "12345678" })).toEqual({
            valid: false,
            error: '"email" cannot be empty.',
        });
    });

    it("rejeita email com formato inválido", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "not-an-email", password: "12345678" })).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
        expect(validateCreateUserInput({ name: "Márcio", email: "user@", password: "12345678" })).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
    });

    it("rejeita email acima de 255 caracteres", () => {
        const longEmail = `${"a".repeat(250)}@example.com`;

        expect(validateCreateUserInput({ name: "Márcio", email: longEmail, password: "12345678" })).toEqual({
            valid: false,
            error: '"email" must be at most 255 characters.',
        });
    });

    it("aceita email válido e normaliza para lowercase com trim", () => {
        expect(
            validateCreateUserInput({ name: "Márcio", email: "  User@Example.COM  ", password: "12345678" }),
        ).toEqual({
            valid: true,
            data: { name: "Márcio", email: "user@example.com", password: "12345678" },
        });
    });
});

describe("validateCreateUserInput - password", () => {
    it("rejeita password ausente", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "a@b.com" })).toEqual({
            valid: false,
            error: '"password" is required.',
        });
    });

    it("rejeita password que não seja string", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "a@b.com", password: 12345678 })).toEqual({
            valid: false,
            error: '"password" must be a string.',
        });
    });

    it("rejeita password menor que 8 caracteres", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "a@b.com", password: "1234567" })).toEqual({
            valid: false,
            error: '"password" must be at least 8 characters.',
        });
    });

    it("rejeita password maior que 128 caracteres", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "a@b.com", password: "a".repeat(129) })).toEqual({
            valid: false,
            error: '"password" must be at most 128 characters.',
        });
    });

    it("rejeita password composta somente por espaços", () => {
        expect(validateCreateUserInput({ name: "Márcio", email: "a@b.com", password: "        " })).toEqual({
            valid: false,
            error: '"password" cannot be only whitespace.',
        });
    });

    it("aceita password válida sem alterar seu conteúdo", () => {
        expect(
            validateCreateUserInput({ name: "Márcio", email: "a@b.com", password: " senha-segura " }),
        ).toEqual({
            valid: true,
            data: { name: "Márcio", email: "a@b.com", password: " senha-segura " },
        });
    });
});
