import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
    E2E_PASSWORD,
    loginViaUI,
    logoutViaUI,
    uniqueEmail,
} from "./helpers/auth";

test("fluxo principal: cadastro, login, tarefas, edição, conclusão, busca, filtros e logout", async ({
    page,
}) => {
    const email = uniqueEmail();
    const titleA = `Estudar Playwright ${randomUUID()}`;
    const titleB = `Revisar AGENTS.md ${randomUUID()}`;
    const titleAEdited = `${titleA} (editada)`;

    // Cadastro
    await page.goto("/register");
    await page.getByLabel("Nome", { exact: true }).fill("Maria");
    await page.getByLabel("Sobrenome", { exact: true }).fill("Silva");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(E2E_PASSWORD);
    await page.getByLabel("Confirmar senha").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Login
    await loginViaUI(page, email);

    // Criar duas tarefas
    await page.getByLabel("Nova tarefa").fill(titleA);
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText(titleA, { exact: true })).toBeVisible();

    await page.getByLabel("Nova tarefa").fill(titleB);
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();

    // Editar a primeira tarefa
    const taskAItem = page.getByRole("listitem").filter({ hasText: titleA });
    await taskAItem
        .getByRole("button", { name: `Editar a tarefa "${titleA}"` })
        .click();
    await page.getByLabel("Editar título da tarefa").fill(titleAEdited);
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(titleAEdited, { exact: true })).toBeVisible();
    await expect(page.getByText(titleA, { exact: true })).toHaveCount(0);

    // Concluir a tarefa editada
    const taskAEditedItem = page
        .getByRole("listitem")
        .filter({ hasText: titleAEdited });
    await taskAEditedItem
        .getByRole("button", { name: `Concluir a tarefa "${titleAEdited}"` })
        .click();
    await expect(
        taskAEditedItem.getByRole("button", {
            name: `Reabrir a tarefa "${titleAEdited}"`,
        }),
    ).toHaveAttribute("aria-pressed", "true");

    // Busca por uma das tarefas
    await page.getByLabel("Buscar tarefas").fill(titleB);
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();
    await expect(page.getByText(titleAEdited, { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Limpar busca" }).click();
    await expect(page.getByText(titleAEdited, { exact: true })).toBeVisible();
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();

    // Filtros
    await page.getByRole("button", { name: "Pendentes", exact: true }).click();
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();
    await expect(page.getByText(titleAEdited, { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Concluídas", exact: true }).click();
    await expect(page.getByText(titleAEdited, { exact: true })).toBeVisible();
    await expect(page.getByText(titleB, { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Todas", exact: true }).click();
    await expect(page.getByText(titleAEdited, { exact: true })).toBeVisible();
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();

    // Logout
    await logoutViaUI(page);

    // Acesso à rota protegida deve redirecionar para o login
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login$/);
});
