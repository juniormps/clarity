import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerUser } from "../services/authService";
import type { User } from "../types/user";
import RegisterPage from "./RegisterPage";

vi.mock("../services/authService", () => ({
    registerUser: vi.fn(),
}));

const mockedRegisterUser = vi.mocked(registerUser);

const mockUser: User = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

type UserEventInstance = ReturnType<typeof userEvent.setup>;

function renderRegisterPage() {
    return render(
        <MemoryRouter initialEntries={["/register"]}>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<div>LoginPage mock</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

async function fillValidForm(user: UserEventInstance) {
    await user.type(screen.getByLabelText("Nome"), "John");
    await user.type(screen.getByLabelText("Sobrenome"), "Doe");
    await user.type(screen.getByLabelText("E-mail"), "john@example.com");
    await user.type(screen.getByLabelText("Senha"), "12345678");
    await user.type(screen.getByLabelText("Confirmar senha"), "12345678");
}

beforeEach(() => {
    mockedRegisterUser.mockReset();
});

describe("RegisterPage — renderização", () => {
    it("renderiza todos os campos e o botão de envio", () => {
        renderRegisterPage();

        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Sobrenome")).toBeInTheDocument();
        expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
        expect(screen.getByLabelText("Senha")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirmar senha")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Criar conta" }),
        ).toBeInTheDocument();
    });
});

describe("RegisterPage — validação", () => {
    it("apresenta erros e não chama o backend ao submeter vazio", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(screen.getByText("Informe seu nome.")).toBeInTheDocument();
        expect(screen.getByText("Informe seu sobrenome.")).toBeInTheDocument();
        expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
        expect(
            screen.getByText("A senha deve ter pelo menos 8 caracteres."),
        ).toBeInTheDocument();
        expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("apresenta erro de e-mail inválido sem chamar o backend", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText("E-mail"), "email-invalido");
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
        expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("apresenta erro de senha curta sem chamar o backend", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText("Senha"), "1234567");
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(
            screen.getByText("A senha deve ter pelo menos 8 caracteres."),
        ).toBeInTheDocument();
        expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("apresenta erro quando a confirmação não coincide", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText("Senha"), "12345678");
        await user.type(screen.getByLabelText("Confirmar senha"), "87654321");
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
        expect(mockedRegisterUser).not.toHaveBeenCalled();
    });
});

describe("RegisterPage — envio", () => {
    it("normaliza nome, sobrenome e e-mail e preserva a senha", async () => {
        mockedRegisterUser.mockResolvedValue(mockUser);
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText("Nome"), "  John  ");
        await user.type(screen.getByLabelText("Sobrenome"), "  Doe  ");
        await user.type(screen.getByLabelText("E-mail"), "  JOHN@example.com  ");
        await user.type(screen.getByLabelText("Senha"), " 12345678");
        await user.type(screen.getByLabelText("Confirmar senha"), " 12345678");
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(mockedRegisterUser).toHaveBeenCalledWith({
            firstName: "John",
            lastName: "Doe",
            email: "JOHN@example.com",
            password: " 12345678",
            passwordConfirmation: " 12345678",
        });
    });

    it("exibe feedback de loading e desabilita o botão durante o envio", async () => {
        mockedRegisterUser.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        const button = screen.getByRole("button", { name: "Criando conta..." });
        expect(button).toBeDisabled();
        expect(mockedRegisterUser).toHaveBeenCalledTimes(1);
    });

    it("exibe erro do servidor e permanece na página", async () => {
        mockedRegisterUser.mockRejectedValue(new Error("Email is already in use."));
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(
            await screen.findByText("Email is already in use."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Criar conta" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("E-mail")).toHaveValue("john@example.com");
        expect(screen.queryByText("LoginPage mock")).not.toBeInTheDocument();
    });

    it("redireciona para /login após cadastro bem-sucedido", async () => {
        mockedRegisterUser.mockResolvedValue(mockUser);
        const user = userEvent.setup();
        renderRegisterPage();

        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(await screen.findByText("LoginPage mock")).toBeInTheDocument();
    });
});
