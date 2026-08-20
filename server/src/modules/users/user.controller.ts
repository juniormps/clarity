import type { NextFunction, Request, Response } from "express";
import { createUser } from "./user.service.js";

//Cria um novo usuário.
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await createUser(req.body);
        res.status(201).json({ data: user });
    } catch (error) {
        next(error);
    }
}
