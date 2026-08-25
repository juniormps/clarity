import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ClearCompletedTasks from "./ClearCompletedTasks";

interface RenderOptions {
    hasCompletedTasks?: boolean;
    isDeleting?: boolean;
    error?: string | null;
}

function renderClearCompletedTasks(
    onDeleteCompleted = vi.fn<() => Promise<void>>(),
    options: RenderOptions = {},
) {
    const view = render(
        <ClearCompletedTasks
            hasCompletedTasks={options.hasCompletedTasks ?? true}
            isDeleting={options.isDeleting ?? false}
            error={options.error ?? null}
            onDeleteCompleted={onDeleteCompleted}
        />,
    );

    return { view, onDeleteCompleted };
}

describe("ClearCompletedTasks — abertura", () => {
    it("abre o modal ao clicar em Limpar concluídas", async () => {
        const user = userEvent.setup();

        renderClearCompletedTasks();

        await user.click(
            screen.getByRole("button", { name: "Limpar concluídas" }),
        );

        expect(screen.getByRole("dialog")).toHaveAttribute("open");
        expect(
            screen.getByRole("heading", {
                name: "Excluir tarefas concluídas?",
            }),
        ).toBeInTheDocument();
    });
});

describe("ClearCompletedTasks — cancelamento", () => {
    it("não chama onDeleteCompleted ao cancelar", async () => {
        const user = userEvent.setup();
        const { view, onDeleteCompleted } = renderClearCompletedTasks();

        await user.click(
            screen.getByRole("button", { name: "Limpar concluídas" }),
        );
        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onDeleteCompleted).not.toHaveBeenCalled();
        expect(view.container.querySelector("dialog")).not.toHaveAttribute("open");
    });
});

describe("ClearCompletedTasks — confirmação", () => {
    it("chama onDeleteCompleted ao confirmar", async () => {
        const user = userEvent.setup();
        const { view, onDeleteCompleted } = renderClearCompletedTasks();

        await user.click(
            screen.getByRole("button", { name: "Limpar concluídas" }),
        );
        await user.click(
            screen.getByRole("button", { name: "Excluir concluídas" }),
        );

        await waitFor(() => expect(onDeleteCompleted).toHaveBeenCalledTimes(1));
        expect(view.container.querySelector("dialog")).not.toHaveAttribute("open");
    });
});

describe("ClearCompletedTasks — estado disabled", () => {
    it("desabilita o botão quando não há tarefas concluídas", () => {
        renderClearCompletedTasks(vi.fn<() => Promise<void>>(), {
            hasCompletedTasks: false,
        });

        expect(
            screen.getByRole("button", { name: "Limpar concluídas" }),
        ).toBeDisabled();
    });

    it("desabilita o botão durante a exclusão", () => {
        renderClearCompletedTasks(vi.fn<() => Promise<void>>(), {
            isDeleting: true,
        });

        expect(
            screen.getByRole("button", { name: "Limpando..." }),
        ).toBeDisabled();
    });
});

describe("ClearCompletedTasks — loading e erro", () => {
    it("exibe Limpando... durante a exclusão", () => {
        renderClearCompletedTasks(vi.fn<() => Promise<void>>(), {
            isDeleting: true,
        });

        expect(
            screen.getByRole("button", { name: "Limpando..." }),
        ).toBeInTheDocument();
    });

    it("exibe o erro recebido com semântica de alerta", () => {
        renderClearCompletedTasks(vi.fn<() => Promise<void>>(), {
            error: "Não foi possível excluir as tarefas concluídas.",
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não foi possível excluir as tarefas concluídas.",
        );
    });
});
