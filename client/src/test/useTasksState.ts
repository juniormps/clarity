import { vi } from "vitest";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/task";

export type TaskState = ReturnType<typeof useTasks>;

// Fabrica um estado completo do useTasks para uso em testes,
// permitindo sobrescrever apenas os campos relevantes de cada cenário.
export function makeTaskState(overrides: Partial<TaskState> = {}): TaskState {
    return {
        tasks: [] as Task[],
        isLoadingTasks: false,
        error: null,
        isCreating: false,
        createError: null,
        createTask: vi.fn<(title: string) => Promise<Task>>(),
        clearCreateError: vi.fn<() => void>(),
        updatingCompletedTaskIds: new Set<number>(),
        updateCompletedErrors: {},
        updateTaskCompleted: vi.fn<(id: number, completed: boolean) => Promise<Task>>(),
        deletingTaskIds: new Set<number>(),
        deleteErrors: {},
        deleteTask: vi.fn<(id: number) => Promise<void>>(),
        isDeletingCompleted: false,
        deleteCompletedError: null,
        deleteCompletedTasks: vi.fn<() => Promise<void>>(),
        editingTaskIds: new Set<number>(),
        editError: null,
        updateTaskTitle: vi.fn<(id: number, title: string) => Promise<Task>>(),
        clearEditError: vi.fn<() => void>(),
        ...overrides,
    };
}
