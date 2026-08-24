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

interface RenderOptions {
    createError?: string | null;
    isCreating?: boolean;
}

function renderTaskComposer(
    createTask: CreateTask,
    options: RenderOptions = {},
) {
    return render(
        <TaskComposer
            createTask={createTask}
            isCreating={options.isCreating ?? false}
            createError={options.createError ?? null}
            clearCreateError={vi.fn<() => void>()}
        />,
    );
}

describe("TaskComposer", () => {
    it("não chama createTask e exibe mensagem ao enviar título vazio", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>();

        renderTaskComposer(createTask);

        await user.click(screen.getByRole("button", { name: "Adicionar" }));

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
        await user.click(screen.getByRole("button", { name: "Adicionar" }));

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
        await user.click(screen.getByRole("button", { name: "Adicionar" }));

        await waitFor(() => expect(createTask).toHaveBeenCalledWith("Estudar React"));
        expect(input).toHaveValue("");
    });

    it("mantém o texto e exibe o erro recebido quando a criação falha", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>().mockRejectedValue(new Error("falha"));

        const { rerender } = renderTaskComposer(createTask);

        const input = screen.getByRole("textbox", { name: "Nova tarefa" });
        await user.type(input, "Minha tarefa");
        await user.click(screen.getByRole("button", { name: "Adicionar" }));

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

    it("exibe o contador inicial 0/140", () => {
        renderTaskComposer(vi.fn<CreateTask>());

        expect(screen.getByText("0/140")).toBeInTheDocument();
    });

    it("atualiza o contador conforme o usuário digita", async () => {
        const user = userEvent.setup();

        renderTaskComposer(vi.fn<CreateTask>());

        await user.type(
            screen.getByRole("textbox", { name: "Nova tarefa" }),
            "Teste",
        );

        expect(screen.getByText("5/140")).toBeInTheDocument();
    });

    it("volta o contador para 0/140 após criação bem-sucedida", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>().mockResolvedValue(makeTask());

        renderTaskComposer(createTask);

        const input = screen.getByRole("textbox", { name: "Nova tarefa" });
        await user.type(input, "Estudar");
        await user.click(screen.getByRole("button", { name: "Adicionar" }));

        await waitFor(() => expect(createTask).toHaveBeenCalledWith("Estudar"));
        expect(screen.getByText("0/140")).toBeInTheDocument();
    });

    it("exibe Adicionando... e desabilita o botão durante a criação", () => {
        renderTaskComposer(vi.fn<CreateTask>(), { isCreating: true });

        const button = screen.getByRole("button", { name: "Adicionando..." });
        expect(button).toBeDisabled();
    });

    it("exibe o contador 140/140 ao atingir o limite de caracteres", async () => {
        const user = userEvent.setup();
        const createTask = vi.fn<CreateTask>().mockResolvedValue(makeTask());

        renderTaskComposer(createTask);

        const title = "a".repeat(140);
        await user.type(screen.getByRole("textbox", { name: "Nova tarefa" }), title);

        expect(screen.getByText("140/140")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Adicionar" }));
        await waitFor(() => expect(createTask).toHaveBeenCalledWith(title));
    });

    it("exibe mensagem de limite ao colar texto que ultrapassa 140 caracteres", async () => {
        const user = userEvent.setup();

        renderTaskComposer(vi.fn<CreateTask>());

        const input = screen.getByRole("textbox", { name: "Nova tarefa" });
        await user.click(input);
        await user.paste("a".repeat(141));

        expect(screen.getByRole("alert")).toHaveTextContent(
            "O título deve ter no máximo 140 caracteres.",
        );
    });
});
