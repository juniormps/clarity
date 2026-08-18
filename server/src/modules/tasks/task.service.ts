import {
    create as createInRepository,
    deleteById,
    deleteCompleted as deleteCompletedInRepository,
    listAll,
    updateCompleted as updateCompletedInRepository,
    updateTitle as updateTitleInRepository,
} from "./task.repository.js";
import type { Task } from "./task.types.js";
import {
    validateCreateTaskInput,
    validateTaskId,
    validateUpdateTaskCompletedInput,
    validateUpdateTaskTitleInput,
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

//Atualiza o título de uma tarefa.
export async function updateTaskTitle(idInput: unknown, body: unknown): Promise<Task> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        const error = new Error(idValidation.error) as Error & {
            status: number;
        };
        error.status = 400;
        throw error;
    }

    const bodyValidation = validateUpdateTaskTitleInput(body);

    if (!bodyValidation.valid) {
        const error = new Error(bodyValidation.error) as Error & {
            status: number;
        };
        error.status = 400;
        throw error;
    }

    const task = await updateTitleInRepository(
        idValidation.data,
        bodyValidation.data.title,
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

//Exclui uma tarefa existente pelo id.
export async function deleteTask(idInput: unknown): Promise<void> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        const error = new Error(idValidation.error) as Error & {
            status: number;
        };
        error.status = 400;
        throw error;
    }

    const removed = await deleteById(idValidation.data);

    if (!removed) {
        const error = new Error("Task not found.") as Error & {
            status: number;
        };
        error.status = 404;
        throw error;
    }
}

//Exclui todas as tarefas concluídas.
export async function deleteCompletedTasks(): Promise<void> {
    await deleteCompletedInRepository();
}
