import type { CookieOptions } from "express";
import { env } from "../../config/env.js";

export const SESSION_COOKIE_NAME = "sid";

//Duração lógica da sessão. É a única fonte de verdade compartilhada entre
//o expires_at persistido no banco (auth.service) e o maxAge do cookie.
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

//Opções base do cookie de sessão. Em produção o cookie é marcado como Secure.
function getSessionCookieBaseOptions(): CookieOptions {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
    };
}

//Opções usadas ao CRIAR o cookie: inclui maxAge alinhado ao TTL da sessão.
export function getSessionCookieOptions(): CookieOptions {
    return {
        ...getSessionCookieBaseOptions(),
        maxAge: SESSION_TTL_MS,
    };
}

//Opções usadas ao REMOVER o cookie (logout). Não inclui maxAge para não
//interferir na expiração definida pelo clearCookie.
export function getSessionCookieClearOptions(): CookieOptions {
    return getSessionCookieBaseOptions();
}
