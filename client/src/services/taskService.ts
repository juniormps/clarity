import type { Task } from "../types/task";

interface ListTasksResponse {
    data: Task[];
}

interface CreateTaskResponse {
    data: Task;
}

interface UpdateTaskCompletedResponse {
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

//Faz a requisição para ATUALIZAR o status completed de uma tarefa
export async function updateTaskCompleted(id: number, completed: boolean): Promise<Task> {
    
    const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update task (${response.status}).`);
    }

    const body = (await response.json()) as UpdateTaskCompletedResponse;

    return body.data;
}

//Faz a requisição para EXCLUIR uma tarefa
export async function deleteTask(id: number): Promise<void> {
    
    const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete task (${response.status}).`);
    }
}
