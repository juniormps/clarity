import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AppLayout from "./AppLayout";

function renderAppLayout() {
    return render(
        <MemoryRouter initialEntries={["/app"]}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/app" element={<div>Conteúdo da área autenticada</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe("AppLayout", () => {
    it("renderiza o conteúdo filho através do Outlet", () => {
        renderAppLayout();

        expect(screen.getByText("Conteúdo da área autenticada")).toBeInTheDocument();
    });
});
