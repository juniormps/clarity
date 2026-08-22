import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./pages/TasksPage", () => ({
    default: () => <div>TasksPage mock</div>,
}));

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <App />
        </MemoryRouter>,
    );
}

describe("App — roteamento", () => {
    it("renderiza HomePage na rota /", () => {
        renderAt("/");

        expect(screen.getByRole("heading", { name: "Clarity" })).toBeInTheDocument();
    });

    it("renderiza LoginPage na rota /login", () => {
        renderAt("/login");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("renderiza RegisterPage na rota /register", () => {
        renderAt("/register");

        expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
    });

    it("renderiza TasksPage na rota /app", () => {
        renderAt("/app");

        expect(screen.getByText("TasksPage mock")).toBeInTheDocument();
    });

    it("renderiza NotFoundPage em uma rota desconhecida", () => {
        renderAt("/rota-inexistente");

        expect(
            screen.getByRole("heading", { name: "Página não encontrada" }),
        ).toBeInTheDocument();
    });
});
