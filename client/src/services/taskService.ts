import type { Task } from "../types/task";

interface ListTasksResponse {
    data: Task[];
}

export async function listTasks(): Promise<Task[]> {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
        throw new Error(`Failed to load tasks (${response.status}).`);
    }

    const body = (await response.json()) as ListTasksResponse;

    return body.data;
}
