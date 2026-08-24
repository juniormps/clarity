import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TaskStats } from "../../utils/getTaskStats";
import TasksHero from "./TasksHero";

const stats: TaskStats = {
    total: 4,
    completed: 3,
    pending: 1,
    percentage: 75,
};

describe("TasksHero", () => {
    it("renderiza eyebrow, título e descrição", () => {
        render(<TasksHero stats={stats} />);

        expect(screen.getByText("Meu espaço produtivo")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Organize hoje.",
        );
        expect(screen.getByText("Respire amanhã.")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Transforme planos em pequenos passos e acompanhe o que realmente importa.",
            ),
        ).toBeInTheDocument();
    });

    it("renderiza o progresso com os dados reais", () => {
        render(<TasksHero stats={stats} />);

        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
        expect(screen.getByText("3 de 4 tarefas concluídas")).toBeInTheDocument();
    });
});
