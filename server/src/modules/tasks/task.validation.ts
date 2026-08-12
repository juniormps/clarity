import type { CreateTaskInput } from "./task.types.js";


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

    const { title } = body as Record<string, unknown>;

    if (typeof title !== "string") {
        return { valid: false, error: '"title" must be a string.' };
    }

    const trimmed = title.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: '"title" cannot be empty.' };
    }

    if (trimmed.length > 140) {
        return {
            valid: false,
            error: '"title" must be at most 140 characters.',
        };
    }

    return { valid: true, data: { title: trimmed } };
}
