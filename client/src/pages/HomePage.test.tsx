import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import HomePage from "./HomePage";

function renderHomePage() {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <HomePage />
        </MemoryRouter>,
    );
}

describe("HomePage — Landing Page", () => {
    it("apresenta o Clarity e sua proposta", () => {
        renderHomePage();

        expect(screen.getByText("Clarity")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "Organize e acompanhe suas tarefas com clareza",
            }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });

    it("possui uma CTA Criar conta", () => {
        renderHomePage();

        expect(screen.getByRole("link", { name: "Criar conta" })).toBeInTheDocument();
    });

    it("a CTA Criar conta aponta para /register", () => {
        renderHomePage();

        expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
            "href",
            "/register",
        );
    });

    it("possui uma CTA Entrar", () => {
        renderHomePage();

        expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    });

    it("a CTA Entrar aponta para /login", () => {
        renderHomePage();

        expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
            "href",
            "/login",
        );
    });
});
