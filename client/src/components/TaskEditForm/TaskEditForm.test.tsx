import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../../types/task";
import TaskEditForm from "./TaskEditForm";

type SaveTask = (id: number, title: string) => Promise<Task>;

function makeTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 1,
        title: "Estudar TypeScript",
        completed: false,
        createdAt: "2026-08-24T15:00:00.000Z",
        updatedAt: "2026-08-24T15:00:00.000Z",
        ...overrides,
    };
}

interface RenderOptions {
    isSaving?: boolean;
    serverError?: string | null;
}

function renderTaskEditForm(task: Task = makeTask(), options: RenderOptions = {}) {
    const onSave = vi.fn<SaveTask>();
    const onCancel = vi.fn<() => void>();
    const onClearServerError = vi.fn<() => void>();

    const view = render(
        <TaskEditForm
            task={task}
            isSaving={options.isSaving ?? false}
            serverError={options.serverError ?? null}
            itemClassName="item"
            onSave={onSave}
            onCancel={onCancel}
            onClearServerError={onClearServerError}
        />,
    );

    return { view, onSave, onCancel, onClearServerError };
}

function getInput() {
    return screen.getByRole("textbox", { name: "Editar título da tarefa" });
}

describe("TaskEditForm — estado inicial", () => {
    it("renderiza o input com o título atual da tarefa", () => {
        renderTaskEditForm(makeTask({ title: "Estudar TypeScript" }));

        expect(getInput()).toHaveValue("Estudar TypeScript");
    });

    it("associa a label acessível Editar título da tarefa", () => {
        renderTaskEditForm();

        expect(
            screen.getByRole("textbox", { name: "Editar título da tarefa" }),
        ).toBeInTheDocument();
    });

    it("aplica maxLength de 140 ao input", () => {
        renderTaskEditForm();

        expect(getInput()).toHaveAttribute("maxlength", "140");
    });

    it("foca o input automaticamente ao abrir", () => {
        renderTaskEditForm();

        expect(getInput()).toHaveFocus();
    });
});

describe("TaskEditForm — validação de vazio", () => {
    it("não chama onSave e exibe alerta ao enviar apenas espaços", async () => {
        const user = userEvent.setup();
        const { onSave } = renderTaskEditForm();

        const input = getInput();
        await user.clear(input);
        await user.type(input, "   ");
        await user.click(screen.getByRole("button", { name: "Salvar" }));

        expect(onSave).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "O título não pode ficar vazio.",
        );
    });
});

describe("TaskEditForm — normalização e sucesso", () => {
    it("envia o título normalizado e fecha a edição após sucesso", async () => {
        const user = userEvent.setup();
        const task = makeTask();
        const { onSave, onCancel } = renderTaskEditForm(task);
        onSave.mockResolvedValue(makeTask({ title: "Estudar TypeScript" }));

        const input = getInput();
        await user.clear(input);
        await user.type(input, "  Estudar TypeScript  ");
        await user.click(screen.getByRole("button", { name: "Salvar" }));

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(task.id, "Estudar TypeScript"),
        );
        expect(onCancel).toHaveBeenCalled();
    });
});

describe("TaskEditForm — falha", () => {
    it("mantém a edição e o texto ao rejeitar onSave", async () => {
        const user = userEvent.setup();
        const task = makeTask();
        const { onSave, onCancel } = renderTaskEditForm(task);
        onSave.mockRejectedValue(new Error("falha"));

        const input = getInput();
        await user.clear(input);
        await user.type(input, "Meu título");
        await user.click(screen.getByRole("button", { name: "Salvar" }));

        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith(task.id, "Meu título"),
        );
        expect(onCancel).not.toHaveBeenCalled();
        expect(getInput()).toHaveValue("Meu título");
        expect(
            screen.getByRole("textbox", { name: "Editar título da tarefa" }),
        ).toBeInTheDocument();
    });
});

describe("TaskEditForm — erro do servidor", () => {
    it("exibe o alerta e marca o input como inválido", () => {
        const { view } = renderTaskEditForm();

        view.rerender(
            <TaskEditForm
                task={makeTask()}
                isSaving={false}
                serverError="Não foi possível editar o título da tarefa."
                itemClassName="item"
                onSave={vi.fn<SaveTask>()}
                onCancel={vi.fn<() => void>()}
                onClearServerError={vi.fn<() => void>()}
            />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível editar o título da tarefa.",
        );

        const input = getInput();
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "task-title-error-1");
    });

    it("chama onClearServerError ao voltar a digitar", async () => {
        const user = userEvent.setup();
        const { onClearServerError } = renderTaskEditForm(makeTask(), {
            serverError: "Não foi possível editar o título da tarefa.",
        });

        await user.type(getInput(), "a");

        expect(onClearServerError).toHaveBeenCalled();
    });
});

describe("TaskEditForm — Cancelar", () => {
    it("chama onCancel ao clicar em Cancelar", async () => {
        const user = userEvent.setup();
        const { onCancel } = renderTaskEditForm();

        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalled();
    });
});

describe("TaskEditForm — saving", () => {
    it("desabilita Salvar e Cancelar e exibe Salvando...", () => {
        renderTaskEditForm(makeTask(), { isSaving: true });

        const saveButton = screen.getByRole("button", { name: "Salvando..." });
        const cancelButton = screen.getByRole("button", { name: "Cancelar" });

        expect(saveButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });
});

describe("TaskEditForm — clique fora", () => {
    it("chama onCancel ao disparar pointerdown em elemento externo", () => {
        const { onCancel } = renderTaskEditForm();

        const external = document.createElement("div");
        document.body.appendChild(external);

        fireEvent.pointerDown(external);

        expect(onCancel).toHaveBeenCalled();
    });

    it("chama onCancel ao disparar pointerdown de toque em elemento externo", () => {
        const { onCancel } = renderTaskEditForm();

        const external = document.createElement("div");
        document.body.appendChild(external);

        fireEvent.pointerDown(external, { pointerType: "touch" });

        expect(onCancel).toHaveBeenCalled();
    });

    it("não chama onCancel ao disparar pointerdown dentro do item", () => {
        const { onCancel } = renderTaskEditForm();

        fireEvent.pointerDown(getInput());

        expect(onCancel).not.toHaveBeenCalled();
    });
});

describe("TaskEditForm — limite de 140", () => {
    it("exibe mensagem de limite ao colar texto que ultrapassa 140 caracteres", () => {
        renderTaskEditForm();

        const input = getInput();
        fireEvent.paste(input, {
            clipboardData: { getData: () => "a".repeat(141) },
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "O título deve ter no máximo 140 caracteres.",
        );
    });
});
