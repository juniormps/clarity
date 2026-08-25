import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../../types/task";
import TaskItem from "./TaskItem";

function makeTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 1,
        title: "Estudar React",
        completed: false,
        createdAt: "2026-08-24T15:00:00.000Z",
        updatedAt: "2026-08-24T15:00:00.000Z",
        ...overrides,
    };
}

interface RenderOptions {
    isUpdating?: boolean;
    isDeleting?: boolean;
    isEditingTitle?: boolean;
    isEditing?: boolean;
    editError?: string | null;
    updateError?: string | null;
    deleteError?: string | null;
}

function renderTaskItem(task: Task, options: RenderOptions = {}) {
    const onToggleCompleted =
        vi.fn<(id: number, completed: boolean) => Promise<Task>>();
    const onDelete = vi.fn<(id: number) => Promise<void>>();
    const onUpdateTitle = vi.fn<(id: number, title: string) => Promise<Task>>();
    const onClearEditError = vi.fn<() => void>();
    const onStartEdit = vi.fn<() => void>();
    const onCancelEdit = vi.fn<() => void>();

    const view = render(
        <TaskItem
            task={task}
            isUpdating={options.isUpdating ?? false}
            isDeleting={options.isDeleting ?? false}
            isEditingTitle={options.isEditingTitle ?? false}
            isEditing={options.isEditing ?? false}
            editError={options.editError ?? null}
            updateError={options.updateError ?? null}
            deleteError={options.deleteError ?? null}
            onToggleCompleted={onToggleCompleted}
            onDelete={onDelete}
            onUpdateTitle={onUpdateTitle}
            onClearEditError={onClearEditError}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
        />,
    );

    return {
        view,
        onToggleCompleted,
        onDelete,
        onUpdateTitle,
        onClearEditError,
        onStartEdit,
        onCancelEdit,
    };
}

describe("TaskItem — tarefa pendente", () => {
    it("renderiza título, data e toggle com nome Concluir e aria-pressed false", () => {
        const task = makeTask();
        const { view } = renderTaskItem(task);

        expect(screen.getByText("Estudar React")).toBeInTheDocument();

        const time = view.container.querySelector("time");
        expect(time).not.toBeNull();
        expect(time!.getAttribute("datetime")).toBe(task.createdAt);

        const toggle = screen.getByRole("button", {
            name: 'Concluir a tarefa "Estudar React"',
        });
        expect(toggle).toHaveAttribute("aria-pressed", "false");
    });
});

describe("TaskItem — tarefa concluída", () => {
    it("toggle possui nome Reabrir e aria-pressed true", () => {
        renderTaskItem(makeTask({ completed: true }));

        const toggle = screen.getByRole("button", {
            name: 'Reabrir a tarefa "Estudar React"',
        });
        expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
});

describe("TaskItem — data", () => {
    it("exibe a data formatada a partir de createdAt", () => {
        const task = makeTask();
        const { view } = renderTaskItem(task);

        const time = view.container.querySelector("time");
        expect(time).not.toBeNull();

        const expected = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
        }).format(new Date(task.createdAt));

        expect(time!.textContent).toBe(expected);
    });
});

describe("TaskItem — toggle", () => {
    it("chama onToggleCompleted(id, true) ao concluir uma pendente", async () => {
        const user = userEvent.setup();
        const task = makeTask();
        const { onToggleCompleted } = renderTaskItem(task);

        await user.click(
            screen.getByRole("button", {
                name: 'Concluir a tarefa "Estudar React"',
            }),
        );

        expect(onToggleCompleted).toHaveBeenCalledWith(task.id, true);
    });

    it("chama onToggleCompleted(id, false) ao reabrir uma concluída", async () => {
        const user = userEvent.setup();
        const task = makeTask({ completed: true });
        const { onToggleCompleted } = renderTaskItem(task);

        await user.click(
            screen.getByRole("button", {
                name: 'Reabrir a tarefa "Estudar React"',
            }),
        );

        expect(onToggleCompleted).toHaveBeenCalledWith(task.id, false);
    });

    it("absorve a rejeição da promise sem propagar o erro", async () => {
        const user = userEvent.setup();
        const task = makeTask();
        const { onToggleCompleted } = renderTaskItem(task);
        onToggleCompleted.mockRejectedValue(new Error("falha"));

        await user.click(
            screen.getByRole("button", {
                name: 'Concluir a tarefa "Estudar React"',
            }),
        );

        expect(onToggleCompleted).toHaveBeenCalledWith(task.id, true);
    });
});

describe("TaskItem — edição", () => {
    it("chama onClearEditError e onStartEdit ao clicar em editar", async () => {
        const user = userEvent.setup();
        const { onClearEditError, onStartEdit } = renderTaskItem(makeTask());

        await user.click(
            screen.getByRole("button", {
                name: 'Editar a tarefa "Estudar React"',
            }),
        );

        expect(onClearEditError).toHaveBeenCalled();
        expect(onStartEdit).toHaveBeenCalled();
    });
});

describe("TaskItem — exclusão", () => {
    it("abre o modal de confirmação ao clicar em excluir", async () => {
        const user = userEvent.setup();

        renderTaskItem(makeTask());

        await user.click(
            screen.getByRole("button", {
                name: 'Excluir a tarefa "Estudar React"',
            }),
        );

        expect(screen.getByRole("dialog")).toHaveAttribute("open");
        expect(
            screen.getByRole("heading", { name: "Excluir tarefa?" }),
        ).toBeInTheDocument();
    });

    it("não chama onDelete quando o usuário cancela a confirmação", async () => {
        const user = userEvent.setup();

        const { view, onDelete } = renderTaskItem(makeTask());

        await user.click(
            screen.getByRole("button", {
                name: 'Excluir a tarefa "Estudar React"',
            }),
        );
        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onDelete).not.toHaveBeenCalled();
        expect(view.container.querySelector("dialog")).not.toHaveAttribute("open");
    });

    it("chama onDelete(task.id) quando o usuário confirma", async () => {
        const user = userEvent.setup();

        const task = makeTask();
        const { view, onDelete } = renderTaskItem(task);

        await user.click(
            screen.getByRole("button", {
                name: 'Excluir a tarefa "Estudar React"',
            }),
        );
        await user.click(screen.getByRole("button", { name: "Excluir" }));

        await waitFor(() => expect(onDelete).toHaveBeenCalledWith(task.id));
        expect(view.container.querySelector("dialog")).not.toHaveAttribute("open");
    });
});

describe("TaskItem — estados busy", () => {
    it("desabilita os controles durante atualização de completed", () => {
        renderTaskItem(makeTask(), { isUpdating: true });

        expect(
            screen.getByRole("button", {
                name: 'Concluir a tarefa "Estudar React"',
            }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", {
                name: 'Editar a tarefa "Estudar React"',
            }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", {
                name: 'Excluir a tarefa "Estudar React"',
            }),
        ).toBeDisabled();
    });

    it("desabilita os controles durante exclusão", () => {
        renderTaskItem(makeTask(), { isDeleting: true });

        expect(
            screen.getByRole("button", {
                name: 'Excluir a tarefa "Estudar React"',
            }),
        ).toBeDisabled();
    });

    it("desabilita os controles durante edição do título", () => {
        renderTaskItem(makeTask(), { isEditingTitle: true });

        expect(
            screen.getByRole("button", {
                name: 'Editar a tarefa "Estudar React"',
            }),
        ).toBeDisabled();
    });
});

describe("TaskItem — erros", () => {
    it("exibe updateError em role=alert", () => {
        renderTaskItem(makeTask(), {
            updateError: "Não foi possível atualizar a tarefa.",
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível atualizar a tarefa.",
        );
    });

    it("exibe deleteError em role=alert", () => {
        renderTaskItem(makeTask(), {
            deleteError: "Não foi possível excluir a tarefa.",
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível excluir a tarefa.",
        );
    });

    it("prioriza updateError quando ambos estão presentes", () => {
        renderTaskItem(makeTask(), {
            updateError: "Erro de atualização",
            deleteError: "Erro de exclusão",
        });

        expect(screen.getByRole("alert")).toHaveTextContent("Erro de atualização");
        expect(screen.getByRole("alert")).not.toHaveTextContent("Erro de exclusão");
    });
});

describe("TaskItem — modo de edição", () => {
    it("delega para TaskEditForm quando isEditing é true", () => {
        renderTaskItem(makeTask(), { isEditing: true });

        expect(
            screen.getByRole("textbox", { name: "Editar título da tarefa" }),
        ).toBeInTheDocument();
    });
});
