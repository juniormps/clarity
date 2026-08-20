import { describe, expect, it } from "vitest";
import { validateCreateUserInput } from "./user.validation.js";

function validBody(overrides: Record<string, unknown> = {}) {
    return {
        firstName: "Márcio",
        lastName: "Pereira",
        email: "user@example.com",
        password: "senha-segura",
        passwordConfirmation: "senha-segura",
        ...overrides,
    };
}

function missing(field: "firstName" | "lastName" | "email" | "password" | "passwordConfirmation") {
    const body = validBody() as Record<string, unknown>;
    delete body[field];
    return body;
}

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

describe("validateCreateUserInput - firstName", () => {
    it("rejeita firstName ausente", () => {
        expect(validateCreateUserInput(missing("firstName"))).toEqual({
            valid: false,
            error: '"firstName" is required.',
        });
    });

    it("rejeita firstName que não seja string", () => {
        expect(validateCreateUserInput(validBody({ firstName: 42 }))).toEqual({
            valid: false,
            error: '"firstName" must be a string.',
        });
    });

    it("rejeita firstName vazio ou apenas com espaços", () => {
        expect(validateCreateUserInput(validBody({ firstName: "" }))).toEqual({
            valid: false,
            error: '"firstName" cannot be empty.',
        });
        expect(validateCreateUserInput(validBody({ firstName: "   " }))).toEqual({
            valid: false,
            error: '"firstName" cannot be empty.',
        });
    });

    it("rejeita firstName acima de 120 caracteres", () => {
        expect(validateCreateUserInput(validBody({ firstName: "a".repeat(121) }))).toEqual({
            valid: false,
            error: '"firstName" must be at most 120 characters.',
        });
    });

    it("aceita firstName válido e remove espaços das extremidades", () => {
        expect(validateCreateUserInput(validBody({ firstName: "  Márcio  " }))).toEqual({
            valid: true,
            data: {
                firstName: "Márcio",
                lastName: "Pereira",
                email: "user@example.com",
                password: "senha-segura",
                passwordConfirmation: "senha-segura",
            },
        });
    });
});

describe("validateCreateUserInput - lastName", () => {
    it("rejeita lastName ausente", () => {
        expect(validateCreateUserInput(missing("lastName"))).toEqual({
            valid: false,
            error: '"lastName" is required.',
        });
    });

    it("rejeita lastName que não seja string", () => {
        expect(validateCreateUserInput(validBody({ lastName: 42 }))).toEqual({
            valid: false,
            error: '"lastName" must be a string.',
        });
    });

    it("rejeita lastName vazio ou apenas com espaços", () => {
        expect(validateCreateUserInput(validBody({ lastName: "" }))).toEqual({
            valid: false,
            error: '"lastName" cannot be empty.',
        });
        expect(validateCreateUserInput(validBody({ lastName: "   " }))).toEqual({
            valid: false,
            error: '"lastName" cannot be empty.',
        });
    });

    it("rejeita lastName acima de 120 caracteres", () => {
        expect(validateCreateUserInput(validBody({ lastName: "a".repeat(121) }))).toEqual({
            valid: false,
            error: '"lastName" must be at most 120 characters.',
        });
    });

    it("aceita lastName válido e remove espaços das extremidades", () => {
        expect(validateCreateUserInput(validBody({ lastName: "  Pereira da Silva  " }))).toEqual({
            valid: true,
            data: {
                firstName: "Márcio",
                lastName: "Pereira da Silva",
                email: "user@example.com",
                password: "senha-segura",
                passwordConfirmation: "senha-segura",
            },
        });
    });
});

describe("validateCreateUserInput - email", () => {
    it("rejeita email ausente", () => {
        expect(validateCreateUserInput(missing("email"))).toEqual({
            valid: false,
            error: '"email" is required.',
        });
    });

    it("rejeita email que não seja string", () => {
        expect(validateCreateUserInput(validBody({ email: 42 }))).toEqual({
            valid: false,
            error: '"email" must be a string.',
        });
    });

    it("rejeita email vazio", () => {
        expect(validateCreateUserInput(validBody({ email: "" }))).toEqual({
            valid: false,
            error: '"email" cannot be empty.',
        });
    });

    it("rejeita email com formato inválido", () => {
        expect(validateCreateUserInput(validBody({ email: "not-an-email" }))).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
        expect(validateCreateUserInput(validBody({ email: "user@" }))).toEqual({
            valid: false,
            error: '"email" must be a valid email address.',
        });
    });

    it("rejeita email acima de 255 caracteres", () => {
        const longEmail = `${"a".repeat(250)}@example.com`;

        expect(validateCreateUserInput(validBody({ email: longEmail }))).toEqual({
            valid: false,
            error: '"email" must be at most 255 characters.',
        });
    });

    it("aceita email válido e normaliza para lowercase com trim", () => {
        expect(validateCreateUserInput(validBody({ email: "  User@Example.COM  " }))).toEqual({
            valid: true,
            data: {
                firstName: "Márcio",
                lastName: "Pereira",
                email: "user@example.com",
                password: "senha-segura",
                passwordConfirmation: "senha-segura",
            },
        });
    });
});

describe("validateCreateUserInput - password", () => {
    it("rejeita password ausente", () => {
        expect(validateCreateUserInput(missing("password"))).toEqual({
            valid: false,
            error: '"password" is required.',
        });
    });

    it("rejeita password que não seja string", () => {
        expect(validateCreateUserInput(validBody({ password: 12345678 }))).toEqual({
            valid: false,
            error: '"password" must be a string.',
        });
    });

    it("rejeita password menor que 8 caracteres", () => {
        expect(validateCreateUserInput(validBody({ password: "1234567" }))).toEqual({
            valid: false,
            error: '"password" must be at least 8 characters.',
        });
    });

    it("rejeita password maior que 128 caracteres", () => {
        expect(validateCreateUserInput(validBody({ password: "a".repeat(129) }))).toEqual({
            valid: false,
            error: '"password" must be at most 128 characters.',
        });
    });

    it("rejeita password composta somente por espaços", () => {
        expect(validateCreateUserInput(validBody({ password: "        " }))).toEqual({
            valid: false,
            error: '"password" cannot be only whitespace.',
        });
    });

    it("aceita password válida sem alterar seu conteúdo", () => {
        expect(
            validateCreateUserInput(
                validBody({ password: " senha-segura ", passwordConfirmation: " senha-segura " }),
            ),
        ).toEqual({
            valid: true,
            data: {
                firstName: "Márcio",
                lastName: "Pereira",
                email: "user@example.com",
                password: " senha-segura ",
                passwordConfirmation: " senha-segura ",
            },
        });
    });
});

describe("validateCreateUserInput - passwordConfirmation", () => {
    it("rejeita passwordConfirmation ausente", () => {
        expect(validateCreateUserInput(missing("passwordConfirmation"))).toEqual({
            valid: false,
            error: '"passwordConfirmation" is required.',
        });
    });

    it("rejeita passwordConfirmation que não seja string", () => {
        expect(validateCreateUserInput(validBody({ passwordConfirmation: 12345678 }))).toEqual({
            valid: false,
            error: '"passwordConfirmation" must be a string.',
        });
    });

    it("rejeita passwordConfirmation diferente de password", () => {
        expect(
            validateCreateUserInput(
                validBody({ password: "12345678", passwordConfirmation: "87654321" }),
            ),
        ).toEqual({
            valid: false,
            error: '"passwordConfirmation" must match "password".',
        });
    });

    it("aceita passwordConfirmation idêntica a password", () => {
        expect(validateCreateUserInput(validBody())).toEqual({
            valid: true,
            data: {
                firstName: "Márcio",
                lastName: "Pereira",
                email: "user@example.com",
                password: "senha-segura",
                passwordConfirmation: "senha-segura",
            },
        });
    });

    it("não normaliza silenciosamente a comparação de senhas", () => {
        expect(
            validateCreateUserInput(
                validBody({ password: "senha123 ", passwordConfirmation: "senha123" }),
            ),
        ).toEqual({
            valid: false,
            error: '"passwordConfirmation" must match "password".',
        });
    });
});
