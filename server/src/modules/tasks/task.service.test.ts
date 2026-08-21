import { beforeEach, describe, expect, it, vi } from "vitest";
import * as taskRepository from "./task.repository.js";
import {
    createTask,
    deleteCompletedTasks,
    deleteTask,
    listTasks,
    updateTaskCompleted,
    updateTaskTitle,
} from "./task.service.js";
import type { Task } from "./task.types.js";

vi.mock("./task.repository.js", () => ({
    create: vi.fn(),
    deleteById: vi.fn(),
    deleteCompleted: vi.fn(),
    listAll: vi.fn(),
    updateCompleted: vi.fn(),
    updateTitle: vi.fn(),
}));

const mockedListAll = vi.mocked(taskRepository.listAll);
const mockedCreate = vi.mocked(taskRepository.create);
const mockedUpdateCompleted = vi.mocked(taskRepository.updateCompleted);
const mockedUpdateTitle = vi.mocked(taskRepository.updateTitle);
const mockedDeleteById = vi.mocked(taskRepository.deleteById);
const mockedDeleteCompleted = vi.mocked(taskRepository.deleteCompleted);

const existingTask: Task = {
    id: 1,
    title: "Estudar TypeScript",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("taskService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("listTasks", () => {
        it("encaminha o userId ao repository", async () => {
            mockedListAll.mockResolvedValueOnce([existingTask]);

            await expect(listTasks(10)).resolves.toEqual([existingTask]);

            expect(mockedListAll).toHaveBeenCalledWith(10);
        });
    });

    describe("createTask", () => {
        it("encaminha userId e título validado ao repository", async () => {
            mockedCreate.mockResolvedValueOnce(existingTask);

            const result = await createTask(10, { title: "  Estudar TypeScript  " });

            expect(result).toEqual(existingTask);
            expect(mockedCreate).toHaveBeenCalledWith(10, { title: "Estudar TypeScript" });
        });

        it("lança AppError 400 sem chamar o repository quando o payload é inválido", async () => {
            await expect(createTask(10, {})).rejects.toMatchObject({ statusCode: 400 });

            expect(mockedCreate).not.toHaveBeenCalled();
        });
    });

    describe("updateTaskCompleted", () => {
        it("encaminha userId, id e completed ao repository", async () => {
            mockedUpdateCompleted.mockResolvedValueOnce({ ...existingTask, completed: true });

            const result = await updateTaskCompleted(10, "1", { completed: true });

            expect(result).toEqual({ ...existingTask, completed: true });
            expect(mockedUpdateCompleted).toHaveBeenCalledWith(10, 1, true);
        });

        it("lança AppError 404 quando a tarefa não pertence ao usuário", async () => {
            mockedUpdateCompleted.mockResolvedValueOnce(null);

            await expect(updateTaskCompleted(10, "999", { completed: true })).rejects.toMatchObject({
                statusCode: 404,
                message: "Task not found.",
            });

            expect(mockedUpdateCompleted).toHaveBeenCalledWith(10, 999, true);
        });

        it("lança AppError 400 sem chamar o repository quando o id é inválido", async () => {
            await expect(updateTaskCompleted(10, "abc", { completed: true })).rejects.toMatchObject({
                statusCode: 400,
            });

            expect(mockedUpdateCompleted).not.toHaveBeenCalled();
        });
    });

    describe("updateTaskTitle", () => {
        it("encaminha userId, id e título validado ao repository", async () => {
            mockedUpdateTitle.mockResolvedValueOnce({ ...existingTask, title: "Novo título" });

            const result = await updateTaskTitle(10, "1", { title: "  Novo título  " });

            expect(result).toEqual({ ...existingTask, title: "Novo título" });
            expect(mockedUpdateTitle).toHaveBeenCalledWith(10, 1, "Novo título");
        });

        it("lança AppError 404 quando a tarefa não pertence ao usuário", async () => {
            mockedUpdateTitle.mockResolvedValueOnce(null);

            await expect(updateTaskTitle(10, "999", { title: "Novo título" })).rejects.toMatchObject({
                statusCode: 404,
                message: "Task not found.",
            });

            expect(mockedUpdateTitle).toHaveBeenCalledWith(10, 999, "Novo título");
        });
    });

    describe("deleteTask", () => {
        it("encaminha userId e id ao repository", async () => {
            mockedDeleteById.mockResolvedValueOnce(true);

            await deleteTask(10, "1");

            expect(mockedDeleteById).toHaveBeenCalledWith(10, 1);
        });

        it("lança AppError 404 quando nenhuma tarefa do usuário foi removida", async () => {
            mockedDeleteById.mockResolvedValueOnce(false);

            await expect(deleteTask(10, "999")).rejects.toMatchObject({
                statusCode: 404,
                message: "Task not found.",
            });

            expect(mockedDeleteById).toHaveBeenCalledWith(10, 999);
        });
    });

    describe("deleteCompletedTasks", () => {
        it("encaminha o userId ao repository", async () => {
            mockedDeleteCompleted.mockResolvedValueOnce(3);

            await deleteCompletedTasks(10);

            expect(mockedDeleteCompleted).toHaveBeenCalledWith(10);
        });
    });
});
