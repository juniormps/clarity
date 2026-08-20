import * as argon2 from "argon2";
import { AppError } from "../../errors/AppError.js";
import { create as createInRepository } from "./user.repository.js";
import type { User } from "./user.types.js";
import { validateCreateUserInput } from "./user.validation.js";

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
} as const;

//Cria um novo usuário, persistindo apenas o hash Argon2id da senha.
export async function createUser(body: unknown): Promise<User> {
    
    const validation = validateCreateUserInput(body);

    if (!validation.valid) {
        throw new AppError(400, validation.error);
    }

    const passwordHash = await argon2.hash(validation.data.password, ARGON2_OPTIONS);

    const user = await createInRepository({
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        email: validation.data.email,
        passwordHash,
    });

    if (user === null) {
        throw new AppError(409, "Email is already in use.");
    }

    return user;
}
