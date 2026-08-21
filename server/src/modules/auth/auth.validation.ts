import type { LoginInput } from "./auth.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Valida e normaliza o email do login, removendo espaços das extremidades e aplicando lowercase.
function validateLoginEmail(
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

//Valida a senha do login sem alterar seu conteúdo.
function validateLoginPassword(
    value: unknown,
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"password" must be a string.' };
    }

    if (value.length === 0) {
        return { valid: false, error: '"password" cannot be empty.' };
    }

    if (value.length > 128) {
        return { valid: false, error: '"password" must be at most 128 characters.' };
    }

    return { valid: true, data: value };
}

//Valida a estrutura da requisição de login.
export function validateLoginInput(
    body: unknown,
): { valid: true; data: LoginInput } | { valid: false; error: string } {
    if (body === null || body === undefined) {
        return { valid: false, error: "Request body is required." };
    }

    if (typeof body !== "object" || Array.isArray(body)) {
        return { valid: false, error: "Request body must be a JSON object." };
    }

    if (!("email" in body)) {
        return { valid: false, error: '"email" is required.' };
    }

    if (!("password" in body)) {
        return { valid: false, error: '"password" is required.' };
    }

    const { email, password } = body as Record<string, unknown>;

    const emailValidation = validateLoginEmail(email);

    if (!emailValidation.valid) {
        return emailValidation;
    }

    const passwordValidation = validateLoginPassword(password);

    if (!passwordValidation.valid) {
        return passwordValidation;
    }

    return {
        valid: true,
        data: {
            email: emailValidation.data,
            password: passwordValidation.data,
        },
    };
}
