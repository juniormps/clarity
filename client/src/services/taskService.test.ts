import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../types/task";
import { HttpError } from "./httpError";
import { createTask, listTasks } from "./taskService";

const task: Task = {
    id: 1,
    title: "Estudar React",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("taskService", () => {
    it("retorna a lista de tarefas em uma resposta 200", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ data: [task] }), { status: 200 }),
        );

        await expect(listTasks()).resolves.toEqual([task]);
    });

    it("lança HttpError com status 401 quando a sessão é inválida", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({ error: "Authentication required." }), {
                status: 401,
            }),
        );

        const promise = createTask("Nova tarefa");

        await expect(promise).rejects.toBeInstanceOf(HttpError);

        try {
            await promise;
        } catch (error) {
            expect((error as HttpError).status).toBe(401);
        }
    });

    it("lança HttpError com status 500 para erro interno do servidor", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, { status: 500 }),
        );

        const promise = listTasks();

        await expect(promise).rejects.toBeInstanceOf(HttpError);

        try {
            await promise;
        } catch (error) {
            expect((error as HttpError).status).toBe(500);
        }
    });
});
