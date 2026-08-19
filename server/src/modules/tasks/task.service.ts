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

//Resgata todas as tarefas do banco de dados.
export async function listTasks(): Promise<Task[]> {
    return listAll();
}

//Cria uma nova tarefa no banco de dados.
export async function createTask(body: unknown): Promise<Task> {
    const validation = validateCreateTaskInput(body);

    if (!validation.valid) {
        throw new AppError(400, validation.error);
    }

    return createInRepository(validation.data);
}

//Atualiza o status completed de uma tarefa.
export async function updateTaskCompleted(idInput: unknown, body: unknown): Promise<Task> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const bodyValidation = validateUpdateTaskCompletedInput(body);

    if (!bodyValidation.valid) {
        throw new AppError(400, bodyValidation.error);
    }

    const task = await updateCompletedInRepository(
        idValidation.data,
        bodyValidation.data.completed,
    );

    if (task === null) {
        throw new AppError(404, "Task not found.");
    }

    return task;
}

//Atualiza o título de uma tarefa.
export async function updateTaskTitle(idInput: unknown, body: unknown): Promise<Task> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const bodyValidation = validateUpdateTaskTitleInput(body);

    if (!bodyValidation.valid) {
        throw new AppError(400, bodyValidation.error);
    }

    const task = await updateTitleInRepository(idValidation.data, bodyValidation.data.title);

    if (task === null) {
        throw new AppError(404, "Task not found.");
    }

    return task;
}

//Exclui uma tarefa existente pelo id.
export async function deleteTask(idInput: unknown): Promise<void> {
    const idValidation = validateTaskId(idInput);

    if (!idValidation.valid) {
        throw new AppError(400, idValidation.error);
    }

    const removed = await deleteById(idValidation.data);

    if (!removed) {
        throw new AppError(404, "Task not found.");
    }
}

//Exclui todas as tarefas concluídas.
export async function deleteCompletedTasks(): Promise<void> {
    await deleteCompletedInRepository();
}
