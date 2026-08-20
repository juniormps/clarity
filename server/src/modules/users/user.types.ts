export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export interface CreateUserRepositoryInput {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
}
