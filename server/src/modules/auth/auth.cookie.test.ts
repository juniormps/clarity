import { describe, expect, it, vi } from "vitest";

//Recarrega o módulo de cookie com o ambiente atual, permitindo testar o
//comportamento do flag Secure para diferentes valores de NODE_ENV.
async function loadSessionCookieModule() {
    vi.resetModules();
    return import("./auth.cookie.js");
}

describe("getSessionCookieOptions", () => {
    it("inclui HttpOnly, SameSite=Lax, Path=/ e Max-Age de 24 horas", async () => {
        vi.unstubAllEnvs();
        const { getSessionCookieOptions, SESSION_TTL_MS } = await loadSessionCookieModule();

        const options = getSessionCookieOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.path).toBe("/");
        expect(options.maxAge).toBe(SESSION_TTL_MS);
        expect(SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000);
    });

    it("marca o cookie como Secure em produção", async () => {
        vi.stubEnv("NODE_ENV", "production");
        const { getSessionCookieOptions } = await loadSessionCookieModule();

        expect(getSessionCookieOptions().secure).toBe(true);
    });

    it("não marca o cookie como Secure fora de produção", async () => {
        vi.stubEnv("NODE_ENV", "development");
        const { getSessionCookieOptions } = await loadSessionCookieModule();

        expect(getSessionCookieOptions().secure).toBe(false);
    });
});

describe("getSessionCookieClearOptions", () => {
    it("mantém as proteções do cookie sem incluir Max-Age", async () => {
        const { getSessionCookieClearOptions } = await loadSessionCookieModule();

        const options = getSessionCookieClearOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.path).toBe("/");
        expect(options.maxAge).toBeUndefined();
    });
});
