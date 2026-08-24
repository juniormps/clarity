import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppHeader from "./AppHeader";

vi.mock("../../features/auth/LogoutButton", () => ({
    default: () => <button type="button">Sair</button>,
}));

function renderAppHeader(pending: number, isLoading = false) {
    return render(
        <MemoryRouter>
            <AppHeader pending={pending} isLoading={isLoading} />
        </MemoryRouter>,
    );
}

describe("AppHeader", () => {
    it("exibe a marca clarity", () => {
        renderAppHeader(0);

        expect(screen.getByRole("link", { name: "clarity" })).toBeInTheDocument();
    });

    it("a marca aponta para /app", () => {
        renderAppHeader(0);

        expect(screen.getByRole("link", { name: "clarity" })).toHaveAttribute(
            "href",
            "/app",
        );
    });

    it("exibe 'Tudo em dia' quando não há pendências", () => {
        renderAppHeader(0);

        expect(screen.getByText("Tudo em dia")).toBeInTheDocument();
    });

    it("exibe singular para uma pendência", () => {
        renderAppHeader(1);

        expect(screen.getByText("1 tarefa pendente")).toBeInTheDocument();
    });

    it("exibe plural para múltiplas pendências", () => {
        renderAppHeader(3);

        expect(screen.getByText("3 tarefas pendentes")).toBeInTheDocument();
    });

    it("exibe estado neutro durante o carregamento inicial", () => {
        renderAppHeader(0, true);

        expect(screen.getByText("Carregando tarefas...")).toBeInTheDocument();
        expect(screen.queryByText("Tudo em dia")).not.toBeInTheDocument();
    });

    it("renderiza o botão de logout", () => {
        renderAppHeader(0);

        expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    });
});
