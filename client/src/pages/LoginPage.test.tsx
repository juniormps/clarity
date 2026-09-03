import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import type { User } from "../types/user";
import LoginPage from "./LoginPage";

vi.mock("../services/authService", () => ({
    loginUser: vi.fn(),
}));

const mockedLoginUser = vi.mocked(loginUser);

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

type UserEventInstance = ReturnType<typeof userEvent.setup>;

type InitialEntries = ComponentProps<typeof MemoryRouter>["initialEntries"];

function renderLoginPage(initialEntries: InitialEntries = ["/login"]) {
    const store = configureStore({
        reducer: { auth: authReducer },
    });

    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/app" element={<div>App mock</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

    return { store, view };
}

async function fillValidForm(user: UserEventInstance) {
    await user.type(screen.getByLabelText("E-mail"), "john@example.com");
    await user.type(screen.getByLabelText("Senha"), "12345678");
}

beforeEach(() => {
    mockedLoginUser.mockReset();
});

describe("LoginPage — renderização", () => {
    it("renderiza os campos E-mail, Senha e o botão Entrar", () => {
        renderLoginPage();

        expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
        expect(screen.getByLabelText("Senha")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    });

    it("possui um main focável pelo skip link", () => {
        renderLoginPage();

        expect(screen.getByRole("main")).toHaveAttribute("id", "conteudo-principal");
        expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
    });
});

describe("LoginPage — confirmação de cadastro", () => {
    it("exibe a mensagem de sucesso quando chega de um cadastro recém-concluído", () => {
        renderLoginPage([
            { pathname: "/login", state: { accountCreated: true } },
        ]);

        const status = screen.getByRole("status");

        expect(status).toBeInTheDocument();
        expect(
            screen.getByText("Conta criada com sucesso!"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Faça login para começar a organizar suas tarefas."),
        ).toBeInTheDocument();
    });

    it("não exibe a mensagem de sucesso ao acessar /login normalmente", () => {
        renderLoginPage();

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(
            screen.queryByText("Conta criada com sucesso!"),
        ).not.toBeInTheDocument();
    });
});

describe("LoginPage — validação", () => {
    it("apresenta erros e não chama o backend ao submeter vazio", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
        expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
        expect(mockedLoginUser).not.toHaveBeenCalled();
    });

    it("apresenta erro de e-mail inválido sem chamar o backend", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByLabelText("E-mail"), "email-invalido");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
        expect(mockedLoginUser).not.toHaveBeenCalled();
    });

    it("apresenta erro de senha vazia sem chamar o backend", async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByLabelText("E-mail"), "john@example.com");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
        expect(mockedLoginUser).not.toHaveBeenCalled();
    });

    it("não exige mínimo de 8 caracteres na senha do login", async () => {
        const user = userEvent.setup();
        mockedLoginUser.mockResolvedValue(mockUser);
        renderLoginPage();

        await user.type(screen.getByLabelText("E-mail"), "john@example.com");
        await user.type(screen.getByLabelText("Senha"), "12345");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(mockedLoginUser).toHaveBeenCalledWith({
            email: "john@example.com",
            password: "12345",
        });
    });
});

describe("LoginPage — envio", () => {
    it("normaliza o e-mail, preserva a senha e autentica no Redux", async () => {
        mockedLoginUser.mockResolvedValue(mockUser);
        const user = userEvent.setup();
        const { store } = renderLoginPage();

        await user.type(screen.getByLabelText("E-mail"), "  JOHN@example.com  ");
        await user.type(screen.getByLabelText("Senha"), " 12345678");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        await screen.findByText("App mock");

        expect(mockedLoginUser).toHaveBeenCalledWith({
            email: "JOHN@example.com",
            password: " 12345678",
        });
        expect(store.getState().auth.status).toBe("authenticated");
        expect(store.getState().auth.user).toEqual(mockUser);
    });

    it("exibe feedback de loading e desabilita o botão durante o envio", async () => {
        mockedLoginUser.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderLoginPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        const button = screen.getByRole("button", { name: "Entrando..." });
        expect(button).toBeDisabled();
        expect(mockedLoginUser).toHaveBeenCalledTimes(1);
    });

    it("exibe erro de credenciais e permanece no login permitindo nova tentativa", async () => {
        mockedLoginUser.mockRejectedValue(new Error("Invalid email or password."));
        const user = userEvent.setup();
        renderLoginPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
        expect(screen.getByLabelText("E-mail")).toHaveValue("john@example.com");
        expect(screen.queryByText("App mock")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    });

    it("redireciona para /app após login bem-sucedido", async () => {
        mockedLoginUser.mockResolvedValue(mockUser);
        const user = userEvent.setup();
        renderLoginPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("App mock")).toBeInTheDocument();
    });
});
