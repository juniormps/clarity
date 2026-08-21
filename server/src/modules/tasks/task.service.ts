import { AppError } from "../../errors/AppError.js";
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

//Resgata as tarefas pertencentes ao usuário autenticado.
export async function listTasks(userId: number): Promise<Task[]> {
    return listAll(userId);
}

//Cria uma nova tarefa associada ao usuário autenticado.
export async function createTask(userId: number, body: unknown): Promise<Task> {
    const validation = validateCreateTaskInput(body);

    if (!validation.valid) {
        throw new AppError(400, validation.error);
    }

    return createInRepository(userId, validation.data);
}

//Atualiza o status completed de uma tarefa do usuário autenticado.
export async function updateTaskCompleted(
    userId: number,
    idInput: unknown,
    body: unknown,
): Promise<Task> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const bodyValidation = validateUpdateTaskCompletedInput(body);

    if (!bodyValidation.valid) {
        throw new AppError(400, bodyValidation.error);
    }

    const task = await updateCompletedInRepository(
        userId,
        idValidation.data,
        bodyValidation.data.completed,
    );

    if (task === null) {
        throw new AppError(404, "Task not found.");
    }

    return task;
}

//Atualiza o título de uma tarefa do usuário autenticado.
export async function updateTaskTitle(
    userId: number,
    idInput: unknown,
    body: unknown,
): Promise<Task> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const bodyValidation = validateUpdateTaskTitleInput(body);

    if (!bodyValidation.valid) {
        throw new AppError(400, bodyValidation.error);
    }

    const task = await updateTitleInRepository(userId, idValidation.data, bodyValidation.data.title);

    if (task === null) {
        throw new AppError(404, "Task not found.");
    }

    return task;
}

//Exclui uma tarefa do usuário autenticado pelo id.
export async function deleteTask(userId: number, idInput: unknown): Promise<void> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const removed = await deleteById(userId, idValidation.data);

    if (!removed) {
        throw new AppError(404, "Task not found.");
    }
}

//Exclui as tarefas concluídas do usuário autenticado.
export async function deleteCompletedTasks(userId: number): Promise<void> {
    await deleteCompletedInRepository(userId);
}
