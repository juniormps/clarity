import { create as createInRepository, listAll } from "./task.repository.js";
import type { Task } from "./task.types.js";
import { validateCreateTaskInput } from "./task.validation.js";


//Resgata todas as tarefas do banco de dados.
export async function listTasks(): Promise<Task[]> {
    return listAll();
}


//Cria uma nova tarefa no banco de dados.
export async function createTask(body: unknown): Promise<Task> {
    const validation = validateCreateTaskInput(body);

    if (!validation.valid) {
        const error = new Error(validation.error) as Error & { status: number };
        error.status = 400;
        throw error;
    }

    return createInRepository(validation.data);
}
