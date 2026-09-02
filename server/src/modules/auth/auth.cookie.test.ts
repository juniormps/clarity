import { afterEach, describe, expect, it, vi } from "vitest";

//Recarrega o módulo de cookie com o ambiente atual, permitindo testar o
//comportamento do SameSite/Secure para diferentes valores de NODE_ENV.
async function loadSessionCookieModule() {
    vi.resetModules();
    return import("./auth.cookie.js");
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("getSessionCookieOptions", () => {
    it("usa SameSite=Lax e Secure=false em desenvolvimento", async () => {
        vi.stubEnv("NODE_ENV", "development");
        const { getSessionCookieOptions } = await loadSessionCookieModule();

        const options = getSessionCookieOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.secure).toBe(false);
        expect(options.path).toBe("/");
    });

    it("usa SameSite=Lax e Secure=true em produção", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("CLIENT_ORIGIN", "https://appclarity.vercel.app");
        const { getSessionCookieOptions } = await loadSessionCookieModule();

        const options = getSessionCookieOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.secure).toBe(true);
        expect(options.path).toBe("/");
    });

    it("preserva o TTL de 24 horas no Max-Age", async () => {
        const { getSessionCookieOptions, SESSION_TTL_MS } = await loadSessionCookieModule();

        const options = getSessionCookieOptions();

        expect(options.maxAge).toBe(SESSION_TTL_MS);
        expect(SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000);
    });
});

describe("getSessionCookieClearOptions", () => {
    it("mantém as proteções do cookie sem incluir Max-Age em desenvolvimento", async () => {
        vi.stubEnv("NODE_ENV", "development");
        const { getSessionCookieClearOptions } = await loadSessionCookieModule();

        const options = getSessionCookieClearOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.secure).toBe(false);
        expect(options.path).toBe("/");
        expect(options.maxAge).toBeUndefined();
    });

    it("mantém SameSite=Lax e Secure ao limpar o cookie em produção", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("CLIENT_ORIGIN", "https://appclarity.vercel.app");
        const { getSessionCookieClearOptions } = await loadSessionCookieModule();

        const options = getSessionCookieClearOptions();

        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("lax");
        expect(options.secure).toBe(true);
        expect(options.path).toBe("/");
        expect(options.maxAge).toBeUndefined();
    });
});
