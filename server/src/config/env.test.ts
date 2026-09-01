import { afterEach, describe, expect, it, vi } from "vitest";

//Recarrega o módulo de ambiente com as variáveis stubbed, permitindo testar
//a resolução de CLIENT_ORIGIN independentemente do .env local.
async function loadEnvModule() {
    vi.resetModules();
    return import("./env.js");
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("CLIENT_ORIGIN", () => {
    it("usa localhost:5173 como padrão fora de produção", async () => {
        vi.stubEnv("NODE_ENV", "development");

        const { env } = await loadEnvModule();

        expect(env.CLIENT_ORIGIN).toBe("http://localhost:5173");
    });

    it("é obrigatória em produção", async () => {
        vi.stubEnv("NODE_ENV", "production");

        await expect(loadEnvModule()).rejects.toThrow(/CLIENT_ORIGIN/);
    });

    it("aceita uma origem HTTPS válida e remove a barra final", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("CLIENT_ORIGIN", "https://appclarity.vercel.app/");

        const { env } = await loadEnvModule();

        expect(env.CLIENT_ORIGIN).toBe("https://appclarity.vercel.app");
    });

    it("rejeita um valor que não é uma origem HTTP/HTTPS", async () => {
        vi.stubEnv("CLIENT_ORIGIN", "not-a-url");

        await expect(loadEnvModule()).rejects.toThrow(/CLIENT_ORIGIN/);
    });
});
