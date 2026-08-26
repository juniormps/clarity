import type { Request, Response } from "express";
import { MemoryStore, rateLimit } from "express-rate-limit";
import type { Options } from "express-rate-limit";

//Resposta 429 consistente com o formato { error } da API, sem expor
//detalhes internos do limiter.
function tooManyRequestsHandler(_req: Request, res: Response): void {
    res.status(429).json({ error: "Too many requests. Please try again later." });
}

//Política de brute force no login: conta tentativas malsucedidas (status >= 400)
//por IP, sem penalizar logins válidos.
export function createLoginRateLimiter(
    overrides: Partial<Options> = {},
): ReturnType<typeof rateLimit> {

    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        skipSuccessfulRequests: true,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: tooManyRequestsHandler,
        ...overrides,
    });
}

//Política de abuso no cadastro: conta todas as requisições (a persistência de
//usuário + Argon2 é o recurso protegido), por IP, em uma janela maior.
export function createRegisterRateLimiter(
    overrides: Partial<Options> = {},
): ReturnType<typeof rateLimit> {
    
    return rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 5,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: tooManyRequestsHandler,
        ...overrides,
    });
}

//Stores dedicados permitem resetar o estado entre testes sem afetar o
//comportamento em produção.
const loginStore = new MemoryStore();
const registerStore = new MemoryStore();

export const loginRateLimiter = createLoginRateLimiter({ store: loginStore });
export const registerRateLimiter = createRegisterRateLimiter({ store: registerStore });

//Reinicia os contadores dos limiters (usado pela suíte de testes).
export async function resetRateLimits(): Promise<void> {
    await loginStore.resetAll();
    await registerStore.resetAll();
}
