import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutUser } from "../../services/authService";
import type { User } from "../../types/user";
import authReducer from "./authSlice";
import type { AuthState } from "./authSlice";
import LogoutButton from "./LogoutButton";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../services/authService", () => ({
    logoutUser: vi.fn(),
}));

const mockedLogoutUser = vi.mocked(logoutUser);

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderLogoutButton() {
    const initialAuth: AuthState = { user: mockUser, status: "authenticated" };

    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: initialAuth },
    });

    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/app"]}>
                <Routes>
                    <Route path="/app" element={<LogoutButton />} />
                    <Route path="/" element={<div>Home mock</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

    return { store, view };
}

//Reproduz a estrutura real: LogoutButton dentro da área protegida, com a
//rota pública Home (/) e a rota de login como destino do ProtectedRoute.
function renderLogoutButtonWithinProtectedRoute() {
    const initialAuth: AuthState = { user: mockUser, status: "authenticated" };

    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: initialAuth },
    });

    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/app"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/app" element={<LogoutButton />} />
                    </Route>
                    <Route path="/" element={<div>Home mock</div>} />
                    <Route path="/login" element={<div>Login mock</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

    return { store, view };
}

beforeEach(() => {
    mockedLogoutUser.mockReset();
});

describe("LogoutButton — sucesso", () => {
    it("chama o logout, desautentica no Redux e navega para /", async () => {
        mockedLogoutUser.mockResolvedValue(undefined);
        const user = userEvent.setup();
        const { store } = renderLogoutButton();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByText("Home mock")).toBeInTheDocument();
        expect(mockedLogoutUser).toHaveBeenCalledTimes(1);
        expect(store.getState().auth.status).toBe("unauthenticated");
        expect(store.getState().auth.user).toBeNull();
    });

    it("dentro da área protegida, o logout navega para / e não para /login", async () => {
        mockedLogoutUser.mockResolvedValue(undefined);
        const user = userEvent.setup();
        const { store } = renderLogoutButtonWithinProtectedRoute();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByText("Home mock")).toBeInTheDocument();
        expect(screen.queryByText("Login mock")).not.toBeInTheDocument();
        expect(store.getState().auth.status).toBe("unauthenticated");
        expect(store.getState().auth.user).toBeNull();
    });
});

describe("LogoutButton — loading", () => {
    it("exibe Saindo... e desabilita o botão durante a chamada", async () => {
        mockedLogoutUser.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderLogoutButton();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        const button = screen.getByRole("button", { name: "Saindo..." });
        expect(button).toBeDisabled();
        expect(mockedLogoutUser).toHaveBeenCalledTimes(1);
    });
});

describe("LogoutButton — falha", () => {
    it("exibe erro, mantém autenticação e não navega para /", async () => {
        mockedLogoutUser.mockRejectedValue(new Error("network error"));
        const user = userEvent.setup();
        const { store } = renderLogoutButton();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("network error");
        expect(store.getState().auth.status).toBe("authenticated");
        expect(store.getState().auth.user).toEqual(mockUser);
        expect(screen.queryByText("Home mock")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();
    });
});
