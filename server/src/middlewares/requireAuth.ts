import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME } from "../modules/auth/auth.cookie.js";
import * as authService from "../modules/auth/auth.service.js";

//Resolve a sessão a partir do cookie e disponibiliza a identidade autenticada em req.auth.
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    
    try {
        const token = req.cookies[SESSION_COOKIE_NAME];
        const user = await authService.me(token);
        req.auth = { userId: user.id };
        next();
    } catch (error) {
        next(error);
    }
}
