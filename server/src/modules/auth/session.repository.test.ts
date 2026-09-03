import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createSession,
    deleteExpiredSessions,
    deleteSessionByTokenHash,
    findUserByTokenHash,
} from "./session.repository.js";

const { executeMock } = vi.hoisted(() => ({ executeMock: vi.fn() }));

vi.mock("../../database/connection.js", () => ({
    pool: { execute: executeMock },
}));

const tokenHash = "a".repeat(64);

describe("createSession", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("cria a sessão com os parâmetros esperados", async () => {
        executeMock.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const expiresAt = new Date("2026-01-02T00:00:00.000Z");

        await createSession({ userId: 7, tokenHash, expiresAt });

        expect(executeMock).toHaveBeenCalledTimes(1);

        const [sql, params] = executeMock.mock.calls[0];

        expect(sql).toContain("INSERT INTO sessions");
        expect(params).toEqual([7, tokenHash, expiresAt]);
    });
});

describe("findUserByTokenHash", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("recupera o usuário de uma sessão válida", async () => {
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

        const user = await findUserByTokenHash(tokenHash);

        expect(user).toEqual({
            id: 7,
            firstName: "Márcio",
            lastName: "Pereira",
            email: "user@example.com",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });

        const [sql, params] = executeMock.mock.calls[0];

        expect(sql).toContain("JOIN users");
        expect(params).toEqual([tokenHash]);
    });

    it("retorna null quando não há sessão correspondente", async () => {
        executeMock.mockResolvedValueOnce([[]]);

        await expect(findUserByTokenHash(tokenHash)).resolves.toBeNull();
    });
});

describe("deleteSessionByTokenHash", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("exclui a sessão pelo token hash", async () => {
        executeMock.mockResolvedValueOnce([{ affectedRows: 1 }]);

        await deleteSessionByTokenHash(tokenHash);

        expect(executeMock).toHaveBeenCalledTimes(1);

        const [sql, params] = executeMock.mock.calls[0];

        expect(sql).toContain("DELETE FROM sessions");
        expect(params).toEqual([tokenHash]);
    });
});

describe("deleteExpiredSessions", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    it("remove todas as sessões cuja expiração já ocorreu", async () => {
        executeMock.mockResolvedValueOnce([{ affectedRows: 3 }]);

        await deleteExpiredSessions();

        expect(executeMock).toHaveBeenCalledTimes(1);

        const [sql, ...params] = executeMock.mock.calls[0];

        expect(sql).toContain("DELETE FROM sessions");
        expect(sql).toContain("expires_at <= CURRENT_TIMESTAMP");
        expect(params).toEqual([]);
    });
});
