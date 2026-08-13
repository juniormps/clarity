import {
    create as createInRepository,
    listAll,
    updateCompleted as updateCompletedInRepository,
} from "./task.repository.js";
import type { Task } from "./task.types.js";
import {
    validateCreateTaskInput,
    validateTaskId,
    validateUpdateTaskCompletedInput,
} from "./task.validation.js";

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

//Atualiza o status completed de uma tarefa.
export async function updateTaskCompleted(idInput: unknown, body: unknown): Promise<Task> {
    
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        const error = new Error(idValidation.error) as Error & {
            status: number;
        };
        error.status = 400;
        throw error;
    }

    const bodyValidation = validateUpdateTaskCompletedInput(body);

    if (!bodyValidation.valid) {
        const error = new Error(bodyValidation.error) as Error & {
            status: number;
        };
        error.status = 400;
        throw error;
    }

    const task = await updateCompletedInRepository(
        idValidation.data,
        bodyValidation.data.completed,
    );

    if (task === null) {
        const error = new Error("Task not found.") as Error & {
            status: number;
        };
        error.status = 404;
        throw error;
    }

    return task;
}
