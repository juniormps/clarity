import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PublicLayout from "./PublicLayout";

function renderPublicLayout(path = "/") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<div>Conteúdo da rota</div>} />
                    <Route path="/login" element={<div>Conteúdo do login</div>} />
                    <Route path="/register" element={<div>Conteúdo do cadastro</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe("PublicLayout", () => {
    it("renderiza o conteúdo da rota através do Outlet", () => {
        renderPublicLayout("/");

        expect(screen.getByText("Conteúdo da rota")).toBeInTheDocument();
    });

    it("exibe a marca Clarity", () => {
        renderPublicLayout("/");

        expect(screen.getByRole("link", { name: "Clarity" })).toBeInTheDocument();
    });

    it("a marca aponta para /", () => {
        renderPublicLayout("/");

        expect(screen.getByRole("link", { name: "Clarity" })).toHaveAttribute("href", "/");
    });

    it("possui navegação Entrar apontando para /login", () => {
        renderPublicLayout("/");

        expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("possui navegação Criar conta apontando para /register", () => {
        renderPublicLayout("/");

        expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
            "href",
            "/register",
        );
    });
});
