import { beforeEach, describe, expect, it, vi } from "vitest";
import { create, findByEmailForAuthentication, isDuplicateEntryError } from "./user.repository.js";

const { executeMock } = vi.hoisted(() => ({ executeMock: vi.fn() }));

vi.mock("../../database/connection.js", () => ({
    pool: { execute: executeMock },
}));

const input = {
    firstName: "Márcio",
    lastName: "Pereira",
    email: "user@example.com",
    passwordHash: "$argon2id$fake",
};

describe("isDuplicateEntryError", () => {
    it("reconhece ER_DUP_ENTRY", () => {
        const error = Object.assign(new Error("duplicate"), { code: "ER_DUP_ENTRY" });
        expect(isDuplicateEntryError(error)).toBe(true);
    });

    it("não reconhece outros erros", () => {
        expect(isDuplicateEntryError(new Error("boom"))).toBe(false);
        expect(isDuplicateEntryError({ code: "ER_BAD_DB_ERROR" })).toBe(false);
        expect(isDuplicateEntryError(null)).toBe(false);
    });
});

describe("findByEmailForAuthentication", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("retorna o usuário com passwordHash quando o email existe", async () => {
        executeMock.mockResolvedValueOnce([
            [
                {
                    id: 7,
                    first_name: "Márcio",
                    last_name: "Pereira",
                    email: "user@example.com",
                    password_hash: "$argon2id$fake",
                    created_at: new Date("2026-01-01T00:00:00.000Z"),
                    updated_at: new Date("2026-01-01T00:00:00.000Z"),
                },
            ],
        ]);

        const user = await findByEmailForAuthentication("user@example.com");

        expect(user).toEqual({
            id: 7,
            firstName: "Márcio",
            lastName: "Pereira",
            email: "user@example.com",
            passwordHash: "$argon2id$fake",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
    });

    it("retorna null quando o email não existe", async () => {
        executeMock.mockResolvedValueOnce([[]]);

        await expect(findByEmailForAuthentication("nao-existe@example.com")).resolves.toBeNull();
    });
});

describe("create", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("retorna null quando o INSERT falha com ER_DUP_ENTRY", async () => {
        executeMock.mockRejectedValueOnce(
            Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" }),
        );

        await expect(create(input)).resolves.toBeNull();
    });

    it("relança outros erros inesperados do banco", async () => {
        executeMock.mockRejectedValueOnce(new Error("boom"));

        await expect(create(input)).rejects.toThrow("boom");
    });

    it("cria o usuário e mapeia o resultado", async () => {
        executeMock.mockResolvedValueOnce([{ insertId: 7 }]);
        executeMock.mockResolvedValueOnce([
            [
                {
                    id: 7,
                    first_name: "Márcio",
                    last_name: "Pereira",
                    email: "user@example.com",
                    created_at: new Date("2026-01-01T00:00:00.000Z"),
                    updated_at: new Date("2026-01-01T00:00:00.000Z"),
                },
            ],
        ]);

        const user = await create(input);

        expect(user).toEqual({
            id: 7,
            firstName: "Márcio",
            lastName: "Pereira",
            email: "user@example.com",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
    });
});
