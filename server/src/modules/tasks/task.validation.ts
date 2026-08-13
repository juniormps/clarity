import type {
    CreateTaskInput,
    UpdateTaskCompletedInput,
    UpdateTaskTitleInput,
} from "./task.types.js";

//Normaliza e valida o campo title, devolvendo o título já sem espaços nas extremidades.
function validateTitle(value: unknown): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"title" must be a string.' };
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: '"title" cannot be empty.' };
    }

    if (trimmed.length > 140) {
        return {
            valid: false,
            error: '"title" must be at most 140 characters.',
        };
    }

    return { valid: true, data: trimmed };
}

//Valida a entrada para criar uma nova tarefa.
export function validateCreateTaskInput(
    body: unknown,
): { valid: true; data: CreateTaskInput } | { valid: false; error: string } {
    if (body === null || body === undefined) {
        return { valid: false, error: "Request body is required." };
    }

    if (typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    if (!("title" in body)) {
        return { valid: false, error: '"title" is required.' };
    }

    const titleValidation = validateTitle((body as Record<string, unknown>).title);

    if (!titleValidation.valid) {
        return titleValidation;
    }

    return { valid: true, data: { title: titleValidation.data } };
}

//Valida o id de uma tarefa vindo de um parâmetro de rota.
export function validateTaskId(raw: unknown): { valid: true; data: number } | { valid: false; error: string } {
    if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
        return { valid: false, error: "Task id must be a positive integer." };
    }

    const id = Number(raw);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return { valid: false, error: "Task id must be a positive integer." };
    }

    return { valid: true, data: id };
}

//Valida a entrada para atualizar o status completed de uma tarefa.
export function validateUpdateTaskCompletedInput(
    body: unknown,
): { valid: true; data: UpdateTaskCompletedInput } | { valid: false; error: string } {
    
    if (body === null || body === undefined) {
        return { valid: false, error: "Request body is required." };
    }

    if (typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    if (!("completed" in body)) {
        return { valid: false, error: '"completed" is required.' };
    }

    const { completed } = body as Record<string, unknown>;

    if (typeof completed !== "boolean") {
        return { valid: false, error: '"completed" must be a boolean.' };
    }

    return { valid: true, data: { completed } };
}

//Valida a entrada para atualizar o título de uma tarefa.
export function validateUpdateTaskTitleInput(
    body: unknown,
): { valid: true; data: UpdateTaskTitleInput } | { valid: false; error: string } {
    if (body === null || body === undefined) {
        return { valid: false, error: "Request body is required." };
    }

    if (typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    if (!("title" in body)) {
        return { valid: false, error: '"title" is required.' };
    }

    const titleValidation = validateTitle((body as Record<string, unknown>).title);

    if (!titleValidation.valid) {
        return titleValidation;
    }

    return { valid: true, data: { title: titleValidation.data } };
}
