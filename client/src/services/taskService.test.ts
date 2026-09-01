import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../types/task";
import { HttpError } from "./httpError";
import {
    createTask,
    deleteCompletedTasks,
    deleteTask,
    listTasks,
    updateTaskCompleted,
    updateTaskTitle,
} from "./taskService";

const task: Task = {
    id: 1,
    title: "Estudar React",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function mockFetch(status: number, body?: unknown) {
    return vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(body === undefined ? null : JSON.stringify(body), {
            status,
        }),
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("taskService", () => {
    it("lista tarefas enviando credentials", async () => {
        const fetchSpy = mockFetch(200, { data: [task] });

        await expect(listTasks()).resolves.toEqual([task]);

        expect(fetchSpy).toHaveBeenCalledWith("/api/tasks", {
            credentials: "include",
        });
    });

    it("cria tarefa enviando credentials", async () => {
        const fetchSpy = mockFetch(201, { data: task });

        await expect(createTask("Nova tarefa")).resolves.toEqual(task);

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/tasks",
            expect.objectContaining({ method: "POST", credentials: "include" }),
        );
    });

    it("atualiza completed enviando credentials", async () => {
        const fetchSpy = mockFetch(200, { data: task });

        await updateTaskCompleted(1, true);

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/tasks/1",
            expect.objectContaining({ method: "PATCH", credentials: "include" }),
        );
    });

    it("atualiza o título enviando credentials", async () => {
        const fetchSpy = mockFetch(200, { data: task });

        await updateTaskTitle(1, "Novo título");

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/tasks/1/title",
            expect.objectContaining({ method: "PATCH", credentials: "include" }),
        );
    });

    it("exclui uma tarefa enviando credentials", async () => {
        const fetchSpy = mockFetch(204);

        await deleteTask(1);

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/tasks/1",
            expect.objectContaining({ method: "DELETE", credentials: "include" }),
        );
    });

    it("exclui as concluídas enviando credentials", async () => {
        const fetchSpy = mockFetch(204);

        await deleteCompletedTasks();

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/tasks/completed",
            expect.objectContaining({ method: "DELETE", credentials: "include" }),
        );
    });

    it("lança HttpError com status 401 quando a sessão é inválida", async () => {
        mockFetch(401, { error: "Authentication required." });

        const promise = createTask("Nova tarefa");

        await expect(promise).rejects.toBeInstanceOf(HttpError);

        try {
            await promise;
        } catch (error) {
            expect((error as HttpError).status).toBe(401);
        }
    });

    it("lança HttpError com status 500 para erro interno do servidor", async () => {
        mockFetch(500);

        const promise = listTasks();

        await expect(promise).rejects.toBeInstanceOf(HttpError);

        try {
            await promise;
        } catch (error) {
            expect((error as HttpError).status).toBe(500);
        }
    });
});
