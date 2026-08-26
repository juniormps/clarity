import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { pool } from "../../src/database/connection.js";
import { resetRateLimits } from "../../src/middlewares/rateLimiters.js";

type TestAgent = ReturnType<typeof request.agent>;

interface TaskResponse {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

const PASSWORD = "senha-teste-123";

const createdEmails: string[] = [];

async function deleteUsersByEmail(emails: string[]): Promise<void> {
    for (const email of emails) {
        await pool.execute("DELETE FROM users WHERE email = ?", [email]);
    }
}

async function registerUser(email: string): Promise<UserResponse> {
    const response = await request(app)
        .post("/api/users")
        .send({
            firstName: "Isolamento",
            lastName: "Teste",
            email,
            password: PASSWORD,
            passwordConfirmation: PASSWORD,
        });

    expect(response.status).toBe(201);

    return response.body.data as UserResponse;
}

async function login(agent: TestAgent, email: string): Promise<void> {
    const response = await agent.post("/api/auth/login").send({ email, password: PASSWORD });

    expect(response.status).toBe(200);
}

afterAll(async () => {
    await deleteUsersByEmail([...createdEmails]);
    await pool.end();
});

describe("isolamento entre usuários nas tarefas", () => {
    let agentA: TestAgent;
    let agentB: TestAgent;
    let emailA: string;
    let emailB: string;

    beforeEach(async () => {
        //A suíte cria vários usuários por teste; zera o rate limit para que o
        //limiter de cadastro não interfira no isolamento em si.
        await resetRateLimits();

        const suffix = randomUUID();
        emailA = `isolation-a-${suffix}@example.com`;
        emailB = `isolation-b-${suffix}@example.com`;

        createdEmails.push(emailA, emailB);

        agentA = request.agent(app);
        agentB = request.agent(app);

        await registerUser(emailA);
        await registerUser(emailB);

        await login(agentA, emailA);
        await login(agentB, emailB);
    });

    afterEach(async () => {
        await deleteUsersByEmail(createdEmails.splice(0));
    });

    it("lista somente as tarefas do usuário A", async () => {
        const titleA = `tarefa-de-A-${randomUUID()}`;
        const titleB = `tarefa-de-B-${randomUUID()}`;

        const createA = await agentA.post("/api/tasks").send({ title: titleA });
        expect(createA.status).toBe(201);

        const createB = await agentB.post("/api/tasks").send({ title: titleB });
        expect(createB.status).toBe(201);

        const listA = await agentA.get("/api/tasks");
        expect(listA.status).toBe(200);

        const tasks = listA.body.data as TaskResponse[];
        const titles = tasks.map((task) => task.title);

        expect(tasks).toHaveLength(1);
        expect(titles).toContain(titleA);
        expect(titles).not.toContain(titleB);
    });

    it("lista somente as tarefas do usuário B", async () => {
        const titleA = `tarefa-de-A-${randomUUID()}`;
        const titleB = `tarefa-de-B-${randomUUID()}`;

        await agentA.post("/api/tasks").send({ title: titleA });
        await agentB.post("/api/tasks").send({ title: titleB });

        const listB = await agentB.get("/api/tasks");
        expect(listB.status).toBe(200);

        const tasks = listB.body.data as TaskResponse[];
        const titles = tasks.map((task) => task.title);

        expect(tasks).toHaveLength(1);
        expect(titles).toContain(titleB);
        expect(titles).not.toContain(titleA);
    });

    it("impede A de alterar o completed da tarefa de B", async () => {
        const titleB = `tarefa-de-B-${randomUUID()}`;

        const createB = await agentB.post("/api/tasks").send({ title: titleB });
        expect(createB.status).toBe(201);

        const taskB = createB.body.data as TaskResponse;

        const updateA = await agentA.patch(`/api/tasks/${taskB.id}`).send({ completed: true });

        expect(updateA.status).toBe(404);
        expect(updateA.body).toEqual({ error: "Task not found." });

        const listB = await agentB.get("/api/tasks");
        const tasksB = listB.body.data as TaskResponse[];
        const persisted = tasksB.find((task) => task.id === taskB.id);

        expect(persisted).toBeDefined();
        expect(persisted?.completed).toBe(false);
    });

    it("impede A de alterar o título da tarefa de B", async () => {
        const titleB = `tarefa-de-B-${randomUUID()}`;

        const createB = await agentB.post("/api/tasks").send({ title: titleB });
        expect(createB.status).toBe(201);

        const taskB = createB.body.data as TaskResponse;

        const updateA = await agentA
            .patch(`/api/tasks/${taskB.id}/title`)
            .send({ title: "título alterado por A" });

        expect(updateA.status).toBe(404);
        expect(updateA.body).toEqual({ error: "Task not found." });

        const listB = await agentB.get("/api/tasks");
        const tasksB = listB.body.data as TaskResponse[];
        const persisted = tasksB.find((task) => task.id === taskB.id);

        expect(persisted).toBeDefined();
        expect(persisted?.title).toBe(titleB);
    });

    it("impede A de excluir a tarefa de B", async () => {
        const titleB = `tarefa-de-B-${randomUUID()}`;

        const createB = await agentB.post("/api/tasks").send({ title: titleB });
        expect(createB.status).toBe(201);

        const taskB = createB.body.data as TaskResponse;

        const removeA = await agentA.delete(`/api/tasks/${taskB.id}`);

        expect(removeA.status).toBe(404);
        expect(removeA.body).toEqual({ error: "Task not found." });

        const listB = await agentB.get("/api/tasks");
        const tasksB = listB.body.data as TaskResponse[];

        expect(tasksB.some((task) => task.id === taskB.id)).toBe(true);
    });

    it("limpar concluídas de A não remove concluídas de B", async () => {
        const pendingA = await agentA.post("/api/tasks").send({ title: `pendente-A-${randomUUID()}` });
        const completedA = await agentA.post("/api/tasks").send({ title: `concluida-A-${randomUUID()}` });
        const pendingB = await agentB.post("/api/tasks").send({ title: `pendente-B-${randomUUID()}` });
        const completedB = await agentB.post("/api/tasks").send({ title: `concluida-B-${randomUUID()}` });

        expect(pendingA.status).toBe(201);
        expect(completedA.status).toBe(201);
        expect(pendingB.status).toBe(201);
        expect(completedB.status).toBe(201);

        const taskCompletedA = completedA.body.data as TaskResponse;
        const taskCompletedB = completedB.body.data as TaskResponse;
        const taskPendingA = pendingA.body.data as TaskResponse;
        const taskPendingB = pendingB.body.data as TaskResponse;

        const completeA = await agentA.patch(`/api/tasks/${taskCompletedA.id}`).send({ completed: true });
        expect(completeA.status).toBe(200);

        const completeB = await agentB.patch(`/api/tasks/${taskCompletedB.id}`).send({ completed: true });
        expect(completeB.status).toBe(200);

        const clearCompletedA = await agentA.delete("/api/tasks/completed");
        expect(clearCompletedA.status).toBe(204);

        const listA = await agentA.get("/api/tasks");
        const titlesA = (listA.body.data as TaskResponse[]).map((task) => task.title);

        expect(titlesA).not.toContain(taskCompletedA.title);
        expect(titlesA).toContain(taskPendingA.title);

        const listB = await agentB.get("/api/tasks");
        const titlesB = (listB.body.data as TaskResponse[]).map((task) => task.title);

        expect(titlesB).toContain(taskCompletedB.title);
        expect(titlesB).toContain(taskPendingB.title);
    });
});

describe("rotas protegidas recusam requisições anônimas", () => {
    const anonymousRequests = [
        {
            label: "GET /api/tasks",
            send: () => request(app).get("/api/tasks"),
        },
        {
            label: "POST /api/tasks",
            send: () => request(app).post("/api/tasks").send({ title: "tarefa" }),
        },
        {
            label: "PATCH /api/tasks/:id",
            send: () => request(app).patch("/api/tasks/1").send({ completed: true }),
        },
        {
            label: "PATCH /api/tasks/:id/title",
            send: () => request(app).patch("/api/tasks/1/title").send({ title: "tarefa" }),
        },
        {
            label: "DELETE /api/tasks/completed",
            send: () => request(app).delete("/api/tasks/completed"),
        },
        {
            label: "DELETE /api/tasks/:id",
            send: () => request(app).delete("/api/tasks/1"),
        },
    ];

    it.each(anonymousRequests)("$label retorna 401", async ({ send }) => {
        const response = await send();

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Authentication required." });
    });
});
