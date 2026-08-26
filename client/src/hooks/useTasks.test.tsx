import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../services/httpError";
import {
    createTask,
    deleteCompletedTasks,
    deleteTask,
    listTasks,
    updateTaskCompleted,
    updateTaskTitle,
} from "../services/taskService";
import { useTasks } from "./useTasks";

vi.mock("../services/taskService", () => ({
    listTasks: vi.fn(),
    createTask: vi.fn(),
    updateTaskCompleted: vi.fn(),
    updateTaskTitle: vi.fn(),
    deleteTask: vi.fn(),
    deleteCompletedTasks: vi.fn(),
}));

const mockedListTasks = vi.mocked(listTasks);
const mockedCreateTask = vi.mocked(createTask);
const mockedUpdateTaskCompleted = vi.mocked(updateTaskCompleted);
const mockedUpdateTaskTitle = vi.mocked(updateTaskTitle);
const mockedDeleteTask = vi.mocked(deleteTask);
const mockedDeleteCompletedTasks = vi.mocked(deleteCompletedTasks);

beforeEach(() => {
    mockedListTasks.mockReset();
    mockedListTasks.mockResolvedValue([]);
    mockedCreateTask.mockReset();
    mockedUpdateTaskCompleted.mockReset();
    mockedUpdateTaskTitle.mockReset();
    mockedDeleteTask.mockReset();
    mockedDeleteCompletedTasks.mockReset();
});

describe("useTasks — sessão expirada durante o uso", () => {
    it("chama onUnauthorized quando criar tarefa retorna 401", async () => {
        mockedCreateTask.mockRejectedValue(
            new HttpError(401, "Failed to create task (401)."),
        );

        const onUnauthorized = vi.fn();
        const { result } = renderHook(() => useTasks(onUnauthorized));

        await waitFor(() => expect(result.current.isLoadingTasks).toBe(false));

        await expect(result.current.createTask("Nova tarefa")).rejects.toBeInstanceOf(
            HttpError,
        );

        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("chama onUnauthorized quando a listagem inicial retorna 401", async () => {
        mockedListTasks.mockRejectedValue(
            new HttpError(401, "Failed to load tasks (401)."),
        );

        const onUnauthorized = vi.fn();
        const { result } = renderHook(() => useTasks(onUnauthorized));

        await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
        expect(result.current.error).toBe("Não foi possível carregar as tarefas.");
    });

    it("não chama onUnauthorized para erros que não são 401", async () => {
        mockedCreateTask.mockRejectedValue(new HttpError(500, "Failed to create task (500)."));

        const onUnauthorized = vi.fn();
        const { result } = renderHook(() => useTasks(onUnauthorized));

        await waitFor(() => expect(result.current.isLoadingTasks).toBe(false));

        await expect(result.current.createTask("Nova tarefa")).rejects.toBeInstanceOf(
            HttpError,
        );

        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("não chama onUnauthorized para erro de rede sem status HTTP", async () => {
        mockedCreateTask.mockRejectedValue(new Error("network error"));

        const onUnauthorized = vi.fn();
        const { result } = renderHook(() => useTasks(onUnauthorized));

        await waitFor(() => expect(result.current.isLoadingTasks).toBe(false));

        await expect(result.current.createTask("Nova tarefa")).rejects.toBeInstanceOf(
            Error,
        );

        expect(onUnauthorized).not.toHaveBeenCalled();
    });
});
