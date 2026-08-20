import type { CreateUserInput } from "./user.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Valida e normaliza um campo de nome, removendo espaços das extremidades.
function validateName(
    value: unknown,
    field: "firstName" | "lastName",
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: `"${field}" must be a string.` };
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: `"${field}" cannot be empty.` };
    }

    if (trimmed.length > 120) {
        return { valid: false, error: `"${field}" must be at most 120 characters.` };
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

//Valida que a confirmação de senha seja idêntica à senha informada.
function validatePasswordConfirmation(
    value: unknown,
    password: string,
): { valid: true; data: string } | { valid: false; error: string } {
    if (typeof value !== "string") {
        return { valid: false, error: '"passwordConfirmation" must be a string.' };
    }

    if (value !== password) {
        return { valid: false, error: '"passwordConfirmation" must match "password".' };
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

    if (!("firstName" in body)) {
        return { valid: false, error: '"firstName" is required.' };
    }

    if (!("lastName" in body)) {
        return { valid: false, error: '"lastName" is required.' };
    }

    if (!("email" in body)) {
        return { valid: false, error: '"email" is required.' };
    }

    if (!("password" in body)) {
        return { valid: false, error: '"password" is required.' };
    }

    if (!("passwordConfirmation" in body)) {
        return { valid: false, error: '"passwordConfirmation" is required.' };
    }

    const { firstName, lastName, email, password, passwordConfirmation } =
        body as Record<string, unknown>;

    const firstNameValidation = validateName(firstName, "firstName");

    if (!firstNameValidation.valid) {
        return firstNameValidation;
    }

    const lastNameValidation = validateName(lastName, "lastName");

    if (!lastNameValidation.valid) {
        return lastNameValidation;
    }

    const emailValidation = validateEmail(email);

    if (!emailValidation.valid) {
        return emailValidation;
    }

    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
        return passwordValidation;
    }

    const passwordConfirmationValidation = validatePasswordConfirmation(
        passwordConfirmation,
        passwordValidation.data,
    );

    if (!passwordConfirmationValidation.valid) {
        return passwordConfirmationValidation;
    }

    return {
        valid: true,
        data: {
            firstName: firstNameValidation.data,
            lastName: lastNameValidation.data,
            email: emailValidation.data,
            password: passwordValidation.data,
            passwordConfirmation: passwordConfirmationValidation.data,
        },
    };
}
