import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

export const E2E_PASSWORD = "senha-e2e-123";

//Gera um email único para cada execução, evitando colisões no banco E2E.
export function uniqueEmail(prefix = "e2e"): string {
    return `${prefix}-${randomUUID()}@example.com`;
}

//Cadastra um usuário pela API real (sem mock) para preparar cenários de teste.
export async function createUserViaApi(
    request: APIRequestContext,
    email: string,
): Promise<void> {
    const response = await request.post("/api/users", {
        data: {
            firstName: "Isolamento",
            lastName: "Teste",
            email,
            password: E2E_PASSWORD,
            passwordConfirmation: E2E_PASSWORD,
        },
    });

    expect(response.status()).toBe(201);
}

//Realiza o login pela interface e aguarda a área autenticada.
export async function loginViaUI(page: Page, email: string): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: "Minhas tarefas" })).toBeVisible();
}

//Encerra a sessão pela interface e aguarda a navegação para a Home pública.
export async function logoutViaUI(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();

    // O logout voluntário deve terminar na Home (/), não em /login.
    await expect(page).toHaveURL(/\/$/);

    await expect(
        page.getByRole("heading", {
            name: "Organize e acompanhe suas tarefas com clareza",
        }),
    ).toBeVisible();
}
