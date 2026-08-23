import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import authReducer from "./authSlice";
import type { AuthState } from "./authSlice";
import GuestRoute from "./GuestRoute";

function renderAt(path: string, auth: AuthState) {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<div>LoginPage mock</div>} />
                        <Route path="/register" element={<div>RegisterPage mock</div>} />
                    </Route>
                    <Route path="/app" element={<div>App mock</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );
}

describe("GuestRoute", () => {
    it("permite /login quando unauthenticated", () => {
        renderAt("/login", { user: null, status: "unauthenticated" });

        expect(screen.getByText("LoginPage mock")).toBeInTheDocument();
    });

    it("permite /register quando unauthenticated", () => {
        renderAt("/register", { user: null, status: "unauthenticated" });

        expect(screen.getByText("RegisterPage mock")).toBeInTheDocument();
    });

    it("redireciona /login para /app quando authenticated", () => {
        renderAt("/login", {
            user: { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", createdAt: "", updatedAt: "" },
            status: "authenticated",
        });

        expect(screen.getByText("App mock")).toBeInTheDocument();
        expect(screen.queryByText("LoginPage mock")).not.toBeInTheDocument();
    });

    it("redireciona /register para /app quando authenticated", () => {
        renderAt("/register", {
            user: { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", createdAt: "", updatedAt: "" },
            status: "authenticated",
        });

        expect(screen.getByText("App mock")).toBeInTheDocument();
        expect(screen.queryByText("RegisterPage mock")).not.toBeInTheDocument();
    });

    it("exibe estado de verificação durante checking", () => {
        renderAt("/login", { user: null, status: "checking" });

        expect(screen.getByRole("status")).toHaveTextContent(
            "Verificando sessão...",
        );
        expect(screen.queryByText("LoginPage mock")).not.toBeInTheDocument();
    });

    it("exibe estado de verificação durante idle", () => {
        renderAt("/register", { user: null, status: "idle" });

        expect(screen.getByRole("status")).toHaveTextContent(
            "Verificando sessão...",
        );
        expect(screen.queryByText("RegisterPage mock")).not.toBeInTheDocument();
    });
});
