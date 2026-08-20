export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

export interface CreateUserRepositoryInput {
    name: string;
    email: string;
    passwordHash: string;
}
