import type { User } from "../types/user";

interface CurrentUserResponse {
    data: User;
}

//Consulta a sessão atual no backend para restaurar o usuário autenticado.
export async function getCurrentUser(): Promise<User | null> {
    const response = await fetch("/api/auth/me");

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to load current user (${response.status}).`);
    }

    const body = (await response.json()) as CurrentUserResponse;

    return body.data;
}
