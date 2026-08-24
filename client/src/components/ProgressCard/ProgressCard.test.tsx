import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProgressCard from "./ProgressCard";

describe("ProgressCard", () => {
    it("expõe as propriedades acessíveis do progressbar", () => {
        render(<ProgressCard total={4} completed={3} percentage={75} />);

        const bar = screen.getByRole("progressbar");

        expect(bar).toHaveAttribute("aria-valuemin", "0");
        expect(bar).toHaveAttribute("aria-valuemax", "100");
        expect(bar).toHaveAttribute("aria-valuenow", "75");
        expect(bar).toHaveAttribute("aria-label", "Progresso das tarefas");
    });

    it("exibe 0% para lista vazia", () => {
        render(<ProgressCard total={0} completed={0} percentage={0} />);

        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
        expect(screen.getByText("0%")).toBeInTheDocument();
        expect(screen.getByText("0 de 0 tarefas concluídas")).toBeInTheDocument();
    });

    it("exibe progresso parcial", () => {
        render(<ProgressCard total={4} completed={3} percentage={75} />);

        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
        expect(screen.getByText("75%")).toBeInTheDocument();
        expect(screen.getByText("3 de 4 tarefas concluídas")).toBeInTheDocument();
    });

    it("exibe 100%", () => {
        render(<ProgressCard total={3} completed={3} percentage={100} />);

        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
        expect(screen.getByText("100%")).toBeInTheDocument();
        expect(screen.getByText("3 de 3 tarefas concluídas")).toBeInTheDocument();
    });

    it("trata singular 1 de 1 tarefa concluída", () => {
        render(<ProgressCard total={1} completed={1} percentage={100} />);

        expect(screen.getByText("1 de 1 tarefa concluída")).toBeInTheDocument();
    });

    it("trata singular parcial 1 de 3 tarefas concluídas", () => {
        render(<ProgressCard total={3} completed={1} percentage={33} />);

        expect(screen.getByText("1 de 3 tarefas concluídas")).toBeInTheDocument();
    });
});
