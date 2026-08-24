import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "./features/auth/authSlice";
import { getCurrentUser } from "./services/authService";
import type { User } from "./types/user";
import App from "./App";

vi.mock("./pages/TasksPage", () => ({
    default: () => <div>TasksPage mock</div>,
}));

vi.mock("./services/authService", () => ({
    getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderAt(path: string) {
    const store = configureStore({
        reducer: { auth: authReducer },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </Provider>,
    );
}

beforeEach(() => {
    mockedGetCurrentUser.mockReset();
});

describe("App — roteamento", () => {
    it("renderiza HomePage na rota /", () => {
        mockedGetCurrentUser.mockResolvedValue(null);
        renderAt("/");

        expect(
            screen.getByRole("heading", {
                name: "Organize e acompanhe suas tarefas com clareza",
            }),
        ).toBeInTheDocument();
    });

    it("renderiza LoginPage na rota /login", async () => {
        mockedGetCurrentUser.mockResolvedValue(null);
        renderAt("/login");

        expect(
            await screen.findByRole("heading", { name: "Entrar" }),
        ).toBeInTheDocument();
    });

    it("renderiza RegisterPage na rota /register", async () => {
        mockedGetCurrentUser.mockResolvedValue(null);
        renderAt("/register");

        expect(
            await screen.findByRole("heading", { name: "Criar conta" }),
        ).toBeInTheDocument();
    });

    it("renderiza NotFoundPage em uma rota desconhecida", () => {
        mockedGetCurrentUser.mockResolvedValue(null);
        renderAt("/rota-inexistente");

        expect(
            screen.getByRole("heading", { name: "Página não encontrada" }),
        ).toBeInTheDocument();
    });
});

describe("App — proteção da rota /app", () => {
    it("renderiza TasksPage quando o usuário está autenticado", async () => {
        mockedGetCurrentUser.mockResolvedValue(mockUser);
        renderAt("/app");

        expect(await screen.findByText("TasksPage mock")).toBeInTheDocument();
    });

    it("redireciona para /login quando não há sessão", async () => {
        mockedGetCurrentUser.mockResolvedValue(null);
        renderAt("/app");

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
        expect(screen.queryByText("TasksPage mock")).not.toBeInTheDocument();
    });

    it("exibe estado de verificação e não mostra TasksPage nem LoginPage durante a checagem", () => {
        mockedGetCurrentUser.mockReturnValue(new Promise(() => {}));
        renderAt("/app");

        expect(screen.getByRole("status")).toHaveTextContent("Verificando sessão...");
        expect(screen.queryByText("TasksPage mock")).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Entrar" })).not.toBeInTheDocument();
    });
});
