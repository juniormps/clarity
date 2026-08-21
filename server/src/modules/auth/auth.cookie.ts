import type { CookieOptions } from "express";

export const SESSION_COOKIE_NAME = "sid";

//Opções do cookie de sessão. Em produção o cookie é marcado como Secure.
export function getSessionCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    };
}
