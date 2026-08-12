import type { Task } from "../types/task";

interface ListTasksResponse {
    data: Task[];
}

interface CreateTaskResponse {
    data: Task;
}

//Faz uma requisição para OBTER a lista de tarefas do backend
export async function listTasks(): Promise<Task[]> {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
        throw new Error(`Failed to load tasks (${response.status}).`);
    }

    const body = (await response.json()) as ListTasksResponse;

    return body.data;
}

//Faz a requisição para CRIAR uma nova tarefa no backend
export async function createTask(title: string): Promise<Task> {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create task (${response.status}).`);
    }

    const body = (await response.json()) as CreateTaskResponse;

    return body.data;
}
