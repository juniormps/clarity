import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../../types/task";
import TaskComposer from "./TaskComposer";

type CreateTask = (title: string) => Promise<Task>;

function makeTask(overrides: Partial<Task> = {}): Task {
    return {
        id: 1,
        title: "Tarefa",
        completed: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        ...overrides,
    };
}

function renderTaskComposer(createTask: CreateTask, createError: string | null = null) {
    return render(
        <TaskComposer
            createTask={createTask}
            isCreating={false}
            createError={createError}
            clearCreateError={vi.fn<() => void>()}
        />,
    );
}

describe("TaskComposer", () => {
    it("não chama createTask e exibe mensagem ao enviar título vazio", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>();

        renderTaskComposer(createTask);

        await user.click(screen.getByRole("button", { name: "Criar" }));

        expect(createTask).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "O título não pode ficar vazio.",
        );
    });

    it("não chama createTask e exibe mensagem ao enviar apenas espaços", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>();

        renderTaskComposer(createTask);

        await user.type(
            screen.getByRole("textbox", { name: "Nova tarefa" }),
            "   ",
        );
        await user.click(screen.getByRole("button", { name: "Criar" }));

        expect(createTask).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "O título não pode ficar vazio.",
        );
    });

    it("envia título normalizado e limpa o campo após sucesso", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>().mockResolvedValue(makeTask());

        renderTaskComposer(createTask);

        const input = screen.getByRole("textbox", { name: "Nova tarefa" });
        await user.type(input, "  Estudar React  ");
        await user.click(screen.getByRole("button", { name: "Criar" }));

        await waitFor(() => expect(createTask).toHaveBeenCalledWith("Estudar React"));
        expect(input).toHaveValue("");
    });

    it("mantém o texto e exibe o erro recebido quando a criação falha", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>().mockRejectedValue(new Error("falha"));

        const { rerender } = renderTaskComposer(createTask);

        const input = screen.getByRole("textbox", { name: "Nova tarefa" });
        await user.type(input, "Minha tarefa");
        await user.click(screen.getByRole("button", { name: "Criar" }));

        await waitFor(() => expect(createTask).toHaveBeenCalledWith("Minha tarefa"));
        expect(input).toHaveValue("Minha tarefa");

        rerender(
            <TaskComposer
                createTask={createTask}
                isCreating={false}
                createError="Não foi possível criar a tarefa."
                clearCreateError={vi.fn<() => void>()}
            />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível criar a tarefa.",
        );
    });
});
