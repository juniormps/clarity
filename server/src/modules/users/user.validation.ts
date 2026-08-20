import type { CreateUserInput } from "./user.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Valida e normaliza o campo name, removendo espaços das extremidades.
function validateName(
    value: unknown,
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"name" must be a string.' };
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: '"name" cannot be empty.' };
    }

    if (trimmed.length > 120) {
        return { valid: false, error: '"name" must be at most 120 characters.' };
    }

    return { valid: true, data: trimmed };
}

//Valida e normaliza o campo email, removendo espaços das extremidades e aplicando lowercase.
function validateEmail(
    value: unknown,
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"email" must be a string.' };
    }

    const normalized = value.trim().toLowerCase();

    if (normalized.length === 0) {
        return { valid: false, error: '"email" cannot be empty.' };
    }

    if (normalized.length > 255) {
        return { valid: false, error: '"email" must be at most 255 characters.' };
    }

    if (!EMAIL_PATTERN.test(normalized)) {
        return { valid: false, error: '"email" must be a valid email address.' };
    }

    return { valid: true, data: normalized };
}

//Valida o campo password sem alterar seu conteúdo.
function validatePassword(
    value: unknown,
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"password" must be a string.' };
    }

    if (value.length < 8) {
        return { valid: false, error: '"password" must be at least 8 characters.' };
    }

    if (value.length > 128) {
        return { valid: false, error: '"password" must be at most 128 characters.' };
    }

    if (value.trim().length === 0) {
        return { valid: false, error: '"password" cannot be only whitespace.' };
    }

    return { valid: true, data: value };
}

//Valida a entrada para criar um novo usuário.
export function validateCreateUserInput(
    body: unknown,
): { valid: true; data: CreateUserInput } | { valid: false; error: string } {
    if (body === null || body === undefined) {
        return { valid: false, error: "Request body is required." };
    }

    if (typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    if (!("name" in body)) {
        return { valid: false, error: '"name" is required.' };
    }

    if (!("email" in body)) {
        return { valid: false, error: '"email" is required.' };
    }

    if (!("password" in body)) {
        return { valid: false, error: '"password" is required.' };
    }

    const { name, email, password } = body as Record<string, unknown>;

    const nameValidation = validateName(name);

    if (!nameValidation.valid) {
        return nameValidation;
    }

    const emailValidation = validateEmail(email);

    if (!emailValidation.valid) {
        return emailValidation;
    }

    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
        return passwordValidation;
    }

    return {
        valid: true,
        data: {
            name: nameValidation.data,
            email: emailValidation.data,
            password: passwordValidation.data,
        },
    };
}
