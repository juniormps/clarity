import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    create,
    deleteById,
    deleteCompleted,
    listAll,
    updateCompleted,
    updateTitle,
} from "./task.repository.js";

const { executeMock } = vi.hoisted(() => ({ executeMock: vi.fn() }));

vi.mock("../../database/connection.js", () => ({
    pool: { execute: executeMock },
}));

const taskRow = {
    id: 1,
    title: "Estudar TypeScript",
    completed: 0,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
};

const expectedTask = {
    id: 1,
    title: "Estudar TypeScript",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("taskRepository", () => {
    beforeEach(() => {
        executeMock.mockReset();
    });

    describe("listAll", () => {
        it("filtra por user_id mantendo a ordenação", async () => {
            executeMock.mockResolvedValueOnce([[taskRow]]);

            await expect(listAll(10)).resolves.toEqual([expectedTask]);

            expect(executeMock).toHaveBeenCalledTimes(1);

            const [sql, params] = executeMock.mock.calls[0];

            expect(sql).toContain("FROM tasks WHERE user_id = ?");
            expect(sql).toContain("ORDER BY created_at DESC, id DESC");
            expect(params).toEqual([10]);
        });
    });

    describe("create", () => {
        it("insere com user_id e busca pelo id + user_id", async () => {
            executeMock.mockResolvedValueOnce([{ insertId: 1 }]);
            executeMock.mockResolvedValueOnce([[taskRow]]);

            await expect(create(10, { title: "Estudar TypeScript" })).resolves.toEqual(expectedTask);

            expect(executeMock).toHaveBeenCalledTimes(2);

            const [insertSql, insertParams] = executeMock.mock.calls[0];

            expect(insertSql).toContain("INSERT INTO tasks (user_id, title)");
            expect(insertParams).toEqual([10, "Estudar TypeScript"]);

            const [selectSql, selectParams] = executeMock.mock.calls[1];

            expect(selectSql).toContain("WHERE id = ? AND user_id = ?");
            expect(selectParams).toEqual([1, 10]);
        });
    });

    describe("updateCompleted", () => {
        it("atualiza e consulta restringindo por id + user_id", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 1 }]);
            executeMock.mockResolvedValueOnce([[{ ...taskRow, completed: 1 }]]);

            const result = await updateCompleted(10, 1, true);

            expect(result).toEqual({ ...expectedTask, completed: true });

            expect(executeMock).toHaveBeenCalledTimes(2);

            const [updateSql, updateParams] = executeMock.mock.calls[0];

            expect(updateSql).toContain("UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?");
            expect(updateParams).toEqual([true, 1, 10]);

            const [selectSql, selectParams] = executeMock.mock.calls[1];

            expect(selectSql).toContain("WHERE id = ? AND user_id = ?");
            expect(selectParams).toEqual([1, 10]);
        });

        it("retorna null quando a tarefa não está no escopo do usuário", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 0 }]);
            executeMock.mockResolvedValueOnce([[]]);

            await expect(updateCompleted(10, 999, true)).resolves.toBeNull();
        });
    });

    describe("updateTitle", () => {
        it("atualiza e consulta restringindo por id + user_id", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 1 }]);
            executeMock.mockResolvedValueOnce([[{ ...taskRow, title: "Novo título" }]]);

            const result = await updateTitle(10, 1, "Novo título");

            expect(result).toEqual({ ...expectedTask, title: "Novo título" });

            const [updateSql, updateParams] = executeMock.mock.calls[0];

            expect(updateSql).toContain("UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?");
            expect(updateParams).toEqual(["Novo título", 1, 10]);

            const [selectSql, selectParams] = executeMock.mock.calls[1];

            expect(selectSql).toContain("WHERE id = ? AND user_id = ?");
            expect(selectParams).toEqual([1, 10]);
        });
    });

    describe("deleteById", () => {
        it("exclui restringindo por id + user_id", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await expect(deleteById(10, 1)).resolves.toBe(true);

            const [sql, params] = executeMock.mock.calls[0];

            expect(sql).toContain("DELETE FROM tasks WHERE id = ? AND user_id = ?");
            expect(params).toEqual([1, 10]);
        });

        it("retorna false quando nenhuma tarefa do usuário foi removida", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await expect(deleteById(10, 999)).resolves.toBe(false);
        });
    });

    describe("deleteCompleted", () => {
        it("exclui apenas as concluídas do usuário", async () => {
            executeMock.mockResolvedValueOnce([{ affectedRows: 2 }]);

            await expect(deleteCompleted(10)).resolves.toBe(2);

            const [sql, params] = executeMock.mock.calls[0];

            expect(sql).toContain("DELETE FROM tasks WHERE user_id = ? AND completed = TRUE");
            expect(params).toEqual([10]);
        });
    });
});
