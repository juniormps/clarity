import { expect, test } from "@playwright/test";
import { E2E_PASSWORD, loginViaUI, uniqueEmail } from "./helpers/auth";

test("sessão deixando de ser válida durante o uso redireciona para /login", async ({
    page,
}) => {
    const email = uniqueEmail("sessao-expirada");

    // Cadastra e autentica normalmente.
    await page.goto("/register");
    await page.getByLabel("Nome", { exact: true }).fill("Maria");
    await page.getByLabel("Sobrenome", { exact: true }).fill("Silva");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel("Confirmar senha").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await loginViaUI(page, email);

    // Invalida a sessão pela API real (logout), sem acionar o fluxo visual.
    // O backend remove a sessão e limpa o cookie, mas o Redux continua
    // acreditando que o usuário está autenticado em /app.
    await page.evaluate(() => fetch("/api/auth/logout", { method: "POST" }));
    await expect(page).toHaveURL(/\/app$/);

    // A próxima operação protegida recebe 401 e leva a aplicação para /login.
    await page.getByLabel("Nova tarefa").fill("Tarefa após expiração");
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page).toHaveURL(/\/login$/);
});
