import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskFilters from "./TaskFilters";

describe("TaskFilters", () => {
    it("exibe as opções Todas, Pendentes e Concluídas", () => {
        render(<TaskFilters activeFilter="all" onFilterChange={vi.fn()} />);

        expect(
            screen.getByRole("button", { name: "Todas" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Pendentes" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Concluídas" }),
        ).toBeInTheDocument();
    });

    it("identifica o filtro ativo", () => {
        render(<TaskFilters activeFilter="pending" onFilterChange={vi.fn()} />);

        expect(
            screen.getByRole("button", { name: "Pendentes" }),
        ).toHaveAttribute("aria-pressed", "true");
        expect(
            screen.getByRole("button", { name: "Todas" }),
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.getByRole("button", { name: "Concluídas" }),
        ).toHaveAttribute("aria-pressed", "false");
    });

    it("chama onFilterChange com o valor correto ao clicar", async () => {
        const user = userEvent.setup();
        const onFilterChange = vi.fn();

        render(<TaskFilters activeFilter="all" onFilterChange={onFilterChange} />);

        await user.click(screen.getByRole("button", { name: "Concluídas" }));

        expect(onFilterChange).toHaveBeenCalledWith("completed");
    });
});
