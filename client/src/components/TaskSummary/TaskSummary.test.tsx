import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Task } from "../../types/task";
import TaskSummary from "./TaskSummary";

function makeTask(id: number, completed: boolean): Task {
    return {
        id,
        title: `Tarefa ${id}`,
        completed,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
    };
}

describe("TaskSummary", () => {
    it("exibe 0 pendentes e 0 concluídas quando não há tarefas", () => {
        render(<TaskSummary tasks={[]} />);

        const summary = screen.getByLabelText("Resumo das tarefas");
        expect(summary).toHaveTextContent("0 pendentes");
        expect(summary).toHaveTextContent("0 concluídas");
    });

    it("usa singular para 1 pendente e 1 concluída", () => {
        render(
            <TaskSummary tasks={[makeTask(1, false), makeTask(2, true)]} />,
        );

        const summary = screen.getByLabelText("Resumo das tarefas");
        expect(summary).toHaveTextContent("1 pendente");
        expect(summary).toHaveTextContent("1 concluída");
    });

    it("usa plural para múltiplos pendentes e concluídas", () => {
        render(
            <TaskSummary
                tasks={[
                    makeTask(1, false),
                    makeTask(2, false),
                    makeTask(3, true),
                    makeTask(4, true),
                    makeTask(5, true),
                ]}
            />,
        );

        const summary = screen.getByLabelText("Resumo das tarefas");
        expect(summary).toHaveTextContent("2 pendentes");
        expect(summary).toHaveTextContent("3 concluídas");
    });

    it("não renderiza barra de progresso própria", () => {
        render(<TaskSummary tasks={[makeTask(1, true)]} />);

        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
});
