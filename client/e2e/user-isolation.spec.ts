import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
    createUserViaApi,
    loginViaUI,
    logoutViaUI,
    uniqueEmail,
} from "./helpers/auth";

test("usuário A não enxerga tarefas do usuário B (e vice-versa)", async ({
    page,
    request,
}) => {
    const emailA = uniqueEmail("isolamento-a");
    const emailB = uniqueEmail("isolamento-b");
    const titleA = `Tarefa do usuário A ${randomUUID()}`;
    const titleB = `Tarefa do usuário B ${randomUUID()}`;

    // Prepara os dois usuários pela API real (sem mock e sem inserção direta).
    await createUserViaApi(request, emailA);
    await createUserViaApi(request, emailB);

    // Login A e criação da tarefa de A.
    await loginViaUI(page, emailA);
    await page.getByLabel("Nova tarefa").fill(titleA);
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText(titleA, { exact: true })).toBeVisible();

    // Logout e login B: B não deve enxergar a tarefa de A.
    await logoutViaUI(page);
    await loginViaUI(page, emailB);
    await expect(page.getByText(titleA, { exact: true })).toHaveCount(0);
    await expect(page.getByText("Sua lista está pronta")).toBeVisible();

    // Criação da tarefa de B.
    await page.getByLabel("Nova tarefa").fill(titleB);
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText(titleB, { exact: true })).toBeVisible();
    await expect(page.getByText(titleA, { exact: true })).toHaveCount(0);

    // Logout e login A: A vê a própria tarefa, mas não a de B.
    await logoutViaUI(page);
    await loginViaUI(page, emailA);
    await expect(page.getByText(titleA, { exact: true })).toBeVisible();
    await expect(page.getByText(titleB, { exact: true })).toHaveCount(0);
});
