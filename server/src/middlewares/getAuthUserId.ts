import type { Request } from "express";
import { AppError } from "../errors/AppError.js";

//Extrai o userId autenticado de req.auth com segurança.
//req.auth é opcional na tipagem global porque rotas públicas podem não tê-lo;
//rotas protegidas por requireAuth sempre o possuem.
export function getAuthUserId(req: Request): number {
    const userId = req.auth?.userId;

    if (userId === undefined) {
        throw new AppError(401, "Authentication required.");
    }

    return userId;
}
