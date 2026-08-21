import type { User } from "../users/user.types.js";

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResult {
    user: User;
    token: string;
}
