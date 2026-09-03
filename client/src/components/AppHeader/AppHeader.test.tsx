import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppHeader from "./AppHeader";

vi.mock("../../features/auth/LogoutButton", () => ({
    default: () => <button type="button">Sair</button>,
}));

function renderAppHeader(firstName?: string) {
    return render(
        <MemoryRouter>
            <AppHeader firstName={firstName} />
        </MemoryRouter>,
    );
}

describe("AppHeader", () => {
    it("exibe a marca clarity", () => {
        renderAppHeader("Márcio");

        expect(screen.getByRole("link", { name: "clarity" })).toBeInTheDocument();
    });

    it("a marca aponta para /app", () => {
        renderAppHeader("Márcio");

        expect(screen.getByRole("link", { name: "clarity" })).toHaveAttribute(
            "href",
            "/app",
        );
    });

    it("exibe uma saudação com o primeiro nome", () => {
        renderAppHeader("Márcio");

        expect(screen.getByText("Olá, Márcio!")).toBeInTheDocument();
    });

    it("exibe uma saudação neutra quando o primeiro nome não está disponível", () => {
        renderAppHeader();

        expect(screen.getByText("Olá!")).toBeInTheDocument();
    });

    it("renderiza o botão de logout", () => {
        renderAppHeader("Márcio");

        expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    });
});
