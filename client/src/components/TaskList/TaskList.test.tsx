import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../../types/task";
import TaskList from "./TaskList";

function makeTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 1,
        title: "Tarefa",
        completed: false,
        createdAt: "2026-08-24T15:00:00.000Z",
        updatedAt: "2026-08-24T15:00:00.000Z",
        ...overrides,
    };
}

interface RenderOptions {
    updatingCompletedTaskIds?: number[];
    deletingTaskIds?: number[];
    editingTaskIds?: number[];
    openEditTaskId?: number | null;
    editError?: string | null;
    updateCompletedErrors?: Record<number, string>;
    deleteErrors?: Record<number, string>;
}

function renderTaskList(tasks: Task[], options: RenderOptions = {}) {
    const onToggleCompleted =
        vi.fn<(id: number, completed: boolean) => Promise<Task>>();
    const onDelete = vi.fn<(id: number) => Promise<void>>();
    const onUpdateTitle = vi.fn<(id: number, title: string) => Promise<Task>>();
    const onClearEditError = vi.fn<() => void>();
    const onStartEdit = vi.fn<(id: number) => void>();
    const onCancelEdit = vi.fn<() => void>();

    render(
        <TaskList
            tasks={tasks}
            updatingCompletedTaskIds={
                new Set(options.updatingCompletedTaskIds ?? [])
            }
            deletingTaskIds={new Set(options.deletingTaskIds ?? [])}
            editingTaskIds={new Set(options.editingTaskIds ?? [])}
            updateCompletedErrors={options.updateCompletedErrors ?? {}}
            deleteErrors={options.deleteErrors ?? {}}
            openEditTaskId={options.openEditTaskId ?? null}
            editError={options.editError ?? null}
            onToggleCompleted={onToggleCompleted}
            onDelete={onDelete}
            onUpdateTitle={onUpdateTitle}
            onClearEditError={onClearEditError}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
        />,
    );

    return {
        onToggleCompleted,
        onDelete,
        onUpdateTitle,
        onClearEditError,
        onStartEdit,
        onCancelEdit,
    };
}

describe("TaskList", () => {
    it("renderiza uma lista semântica", () => {
        renderTaskList([makeTask()]);

        expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("renderiza todos os itens recebidos", () => {
        renderTaskList([
            makeTask({ id: 1, title: "Primeira" }),
            makeTask({ id: 2, title: "Segunda" }),
            makeTask({ id: 3, title: "Terceira" }),
        ]);

        expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("preserva a ordem das tarefas recebidas", () => {
        renderTaskList([
            makeTask({ id: 1, title: "Primeira" }),
            makeTask({ id: 2, title: "Segunda" }),
            makeTask({ id: 3, title: "Terceira" }),
        ]);

        const items = screen.getAllByRole("listitem");
        expect(items[0]).toHaveTextContent("Primeira");
        expect(items[1]).toHaveTextContent("Segunda");
        expect(items[2]).toHaveTextContent("Terceira");
    });

    it("encaminha o estado completed para cada item", () => {
        renderTaskList([
            makeTask({ id: 1, title: "Pendente", completed: false }),
            makeTask({ id: 2, title: "Concluída", completed: true }),
        ]);

        expect(
            screen.getByRole("button", { name: 'Concluir a tarefa "Pendente"' }),
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.getByRole("button", { name: 'Reabrir a tarefa "Concluída"' }),
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("integra o início de edição de um item específico", async () => {
        const user = userEvent.setup();
        const { onStartEdit, onClearEditError } = renderTaskList([
            makeTask({ id: 1, title: "Primeira" }),
            makeTask({ id: 2, title: "Segunda" }),
        ]);

        await user.click(
            screen.getByRole("button", { name: 'Editar a tarefa "Segunda"' }),
        );

        expect(onClearEditError).toHaveBeenCalled();
        expect(onStartEdit).toHaveBeenCalledWith(2);
    });
});
