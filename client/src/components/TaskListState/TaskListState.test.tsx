import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TaskListState from "./TaskListState";

describe("TaskListState — empty", () => {
    it("exibe o título e a descrição de nenhuma tarefa", () => {
        render(<TaskListState variant="empty" />);

        expect(screen.getByText("Sua lista está pronta")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Adicione sua primeira tarefa e comece com um pequeno passo.",
            ),
        ).toBeInTheDocument();
    });
});

describe("TaskListState — search", () => {
    it("exibe o estado de busca sem resultado", () => {
        render(<TaskListState variant="search" />);

        expect(
            screen.getByText("Nenhuma tarefa encontrada"),
        ).toBeInTheDocument();
    });
});

describe("TaskListState — pending", () => {
    it("exibe o estado de nenhuma pendência", () => {
        render(<TaskListState variant="pending" />);

        expect(
            screen.getByText("Nenhuma pendência por aqui"),
        ).toBeInTheDocument();
    });
});

describe("TaskListState — completed", () => {
    it("exibe o estado de nenhuma tarefa concluída", () => {
        render(<TaskListState variant="completed" />);

        expect(
            screen.getByText("Ainda não há tarefas concluídas"),
        ).toBeInTheDocument();
    });
});

describe("TaskListState — error", () => {
    it("exibe a mensagem recebida por prop com semântica de erro", () => {
        render(
            <TaskListState
                variant="error"
                message="Não foi possível carregar as tarefas."
            />,
        );

        expect(
            screen.getByRole("alert"),
        ).toHaveTextContent("Não foi possível carregar as tarefas.");
    });
});

describe("TaskListState — loading", () => {
    it("expõe a mensagem de carregamento de forma acessível", () => {
        render(<TaskListState variant="loading" />);

        expect(
            screen.getByText("Carregando tarefas..."),
        ).toBeInTheDocument();
    });
});
