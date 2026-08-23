import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types/user";
import { getCurrentUser, registerUser } from "./authService";

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

const registerInput = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "12345678",
    passwordConfirmation: "12345678",
};

function mockFetch(status: number, body?: unknown) {
    const response = new Response(body === undefined ? null : JSON.stringify(body), {
        status,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("authService — getCurrentUser", () => {
    it("retorna o usuário quando a resposta é 200", async () => {
        mockFetch(200, { data: mockUser });

        await expect(getCurrentUser()).resolves.toEqual(mockUser);
    });

    it("retorna null quando a resposta é 401", async () => {
        mockFetch(401);

        await expect(getCurrentUser()).resolves.toBeNull();
    });

    it("lança erro para um status HTTP não bem-sucedido", async () => {
        mockFetch(500);

        await expect(getCurrentUser()).rejects.toThrow(
            "Failed to load current user (500).",
        );
    });
});

describe("authService — registerUser", () => {
    it("retorna o usuário criado em uma resposta 201", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(JSON.stringify({ data: mockUser }), { status: 201 }),
            );

        await expect(registerUser(registerInput)).resolves.toEqual(mockUser);

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/users",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerInput),
            }),
        );
    });

    it("rejeita com a mensagem do backend para email duplicado", async () => {
        mockFetch(409, { error: "Email is already in use." });

        await expect(registerUser(registerInput)).rejects.toThrow(
            "Email is already in use.",
        );
    });

    it("preserva a mensagem útil do servidor em um erro de validação", async () => {
        mockFetch(400, { error: '"email" must be a valid email address.' });

        await expect(registerUser(registerInput)).rejects.toThrow(
            '"email" must be a valid email address.',
        );
    });

    it("usa fallback com o status quando não há mensagem utilizável", async () => {
        mockFetch(500);

        await expect(registerUser(registerInput)).rejects.toThrow(
            "Failed to register user (500).",
        );
    });
});
