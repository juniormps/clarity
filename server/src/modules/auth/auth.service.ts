import * as argon2 from "argon2";
import { AppError } from "../../errors/AppError.js";
import { findByEmailForAuthentication } from "../users/user.repository.js";
import type { User } from "../users/user.types.js";
import type { LoginResult } from "./auth.types.js";
import { validateLoginInput } from "./auth.validation.js";
import {
    createSession,
    deleteExpiredSessions,
    deleteSessionByTokenHash,
    findUserByTokenHash,
} from "./session.repository.js";
import { SESSION_TTL_MS } from "./auth.cookie.js";
import { generateSessionToken, hashSessionToken } from "./session.token.js";

//Autentica o usuário, cria uma sessão e retorna o usuário seguro junto do token.
export async function login(body: unknown): Promise<LoginResult> {
    const validation = validateLoginInput(body);

    if (!validation.valid) {
        throw new AppError(400, validation.error);
    }

    const { email, password } = validation.data;

    const user = await findByEmailForAuthentication(email);

    if (user === null) {
        throw new AppError(401, "Invalid email or password.");
    }

    const validPassword = await argon2.verify(user.passwordHash, password);

    if (!validPassword) {
        throw new AppError(401, "Invalid email or password.");
    }

    await deleteExpiredSessions();

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await createSession({
        userId: user.id,
        tokenHash,
        expiresAt,
    });

    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
}

//Resolve o usuário autenticado a partir de um token de sessão.
export async function me(token: string | undefined): Promise<User> {
    if (!token) {
        throw new AppError(401, "Authentication required.");
    }

    const tokenHash = hashSessionToken(token);
    const user = await findUserByTokenHash(tokenHash);

    if (user === null) {
        throw new AppError(401, "Authentication required.");
    }

    return user;
}

//Encerra a sessão correspondente ao token. Idempotente.
export async function logout(token: string | undefined): Promise<void> {
    
    if (!token) {
        return;
    }

    const tokenHash = hashSessionToken(token);
    await deleteSessionByTokenHash(tokenHash);
}
