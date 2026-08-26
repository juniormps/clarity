import type { NextFunction, Request, Response } from "express";
import {
    getSessionCookieClearOptions,
    getSessionCookieOptions,
    SESSION_COOKIE_NAME,
} from "./auth.cookie.js";
import * as authService from "./auth.service.js";

//Autentica o usuário, configura o cookie de sessão e retorna o usuário seguro.
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { user, token } = await authService.login(req.body);
        res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
}

//Retorna o usuário autenticado a partir do cookie de sessão.
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.cookies[SESSION_COOKIE_NAME];
        const user = await authService.me(token);
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
}

//Encerra a sessão atual e limpa o cookie.
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.cookies[SESSION_COOKIE_NAME];
        await authService.logout(token);
        res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieClearOptions());
        res.status(204).end();
    } catch (error) {
        next(error);
    }
}
