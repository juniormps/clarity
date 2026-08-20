import * as argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../errors/AppError.js";
import { create } from "./user.repository.js";
import { createUser } from "./user.service.js";
import type { User } from "./user.types.js";

vi.mock("./user.repository.js", () => ({
    create: vi.fn(),
}));

const mockedCreate = vi.mocked(create);

const validBody = {
    name: "  Márcio Júnior  ",
    email: "  User@Example.COM  ",
    password: "senha-segura",
};

const existingUser: User = {
    id: 1,
    name: "Márcio Júnior",
    email: "user@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("createUser", () => {
    beforeEach(() => {
        mockedCreate.mockReset();
    });

    it("lança AppError 400 quando a validação falha", async () => {
        const promise = createUser({});

        await expect(promise).rejects.toBeInstanceOf(AppError);

        try {
            await promise;
        } catch (error) {
            expect((error as AppError).statusCode).toBe(400);
        }

        expect(mockedCreate).not.toHaveBeenCalled();
    });

    it("cria o usuário com dados normalizados e hash Argon2id", async () => {
        mockedCreate.mockResolvedValueOnce(existingUser);

        const user = await createUser(validBody);

        expect(user).toEqual(existingUser);
        expect(mockedCreate).toHaveBeenCalledTimes(1);

        const repositoryInput = mockedCreate.mock.calls[0][0];

        expect(repositoryInput.name).toBe("Márcio Júnior");
        expect(repositoryInput.email).toBe("user@example.com");
        expect(repositoryInput).not.toHaveProperty("password");
        expect(repositoryInput.passwordHash).not.toBe(validBody.password);

        const { passwordHash } = repositoryInput;
        expect(passwordHash.startsWith("$argon2id$")).toBe(true);
        await expect(argon2.verify(passwordHash, validBody.password)).resolves.toBe(true);
    });

    it("lança AppError 409 quando o email já está em uso", async () => {
        mockedCreate.mockResolvedValueOnce(null);

        const promise = createUser(validBody);

        await expect(promise).rejects.toBeInstanceOf(AppError);

        try {
            await promise;
        } catch (error) {
            expect((error as AppError).statusCode).toBe(409);
            expect((error as AppError).message).toBe("Email is already in use.");
        }
    });

    it("propaga erros inesperados do repository", async () => {
        mockedCreate.mockRejectedValueOnce(new Error("boom"));

        await expect(createUser(validBody)).rejects.toThrow("boom");
    });
});
