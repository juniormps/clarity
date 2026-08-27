import { apiUrl } from "../config/api";
import type { User } from "../types/user";

interface CurrentUserResponse {
    data: User;
}

interface RegisterUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

interface ErrorResponse {
    error?: unknown;
}

//Consulta a sessão atual no backend para restaurar o usuário autenticado.
export async function getCurrentUser(): Promise<User | null> {
    const response = await fetch(apiUrl("/api/auth/me"));

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to load current user (${response.status}).`);
    }

    const body = (await response.json()) as CurrentUserResponse;

    return body.data;
}

//Cadastra um novo usuário no backend. Não cria sessão autenticada.
export async function registerUser(input: RegisterUserInput): Promise<User> {

    const response = await fetch(apiUrl("/api/users"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error(
            await extractErrorMessage(
                response,
                `Failed to register user (${response.status}).`,
            ),
        );
    }

    const body = (await response.json()) as CurrentUserResponse;

    return body.data;
}

//Autentica um usuário existente. Cria a sessão HttpOnly no backend.
export async function loginUser(credentials: LoginCredentials): Promise<User> {

    const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error(
            await extractErrorMessage(
                response,
                `Failed to log in (${response.status}).`,
            ),
        );
    }

    const body = (await response.json()) as CurrentUserResponse;

    return body.data;
}

//Encerra a sessão atual, invalidando o cookie HttpOnly no backend.
export async function logoutUser(): Promise<void> {

    const response = await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(
            await extractErrorMessage(
                response,
                `Failed to log out (${response.status}).`,
            ),
        );
    }
}

//Extrai a mensagem de erro fornecida pelo backend, com fallback para o status HTTP.
async function extractErrorMessage( response: Response, fallback: string ): Promise<string> {

    try {
        const body = (await response.json()) as ErrorResponse;

        if (typeof body.error === "string" && body.error.trim().length > 0) {
            return body.error;
        }
        
    } catch {
        // Resposta sem corpo JSON utilizável: mantém o fallback.
    }

    return fallback;
}
