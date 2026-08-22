import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types/user";
import { getCurrentUser } from "./authService";

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
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
