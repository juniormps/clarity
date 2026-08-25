import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

//Configuração do Playwright para os testes E2E do Clarity.
//
//Os testes rodam contra um banco exclusivo (clarity_e2e). O backend Express é
//iniciado aqui com DB_NAME=clarity_e2e, e o frontend Vite continua fazendo o
//proxy de /api para o Express na porta 3000. `reuseExistingServer: false` e o
//`--strictPort` do Vite garantem que uma instância de desenvolvimento já em
//execução (conectada ao banco `clarity`) cause falha clara em vez de ser
//reutilizada silenciosamente.
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    timeout: 60_000,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: [
        {
            command: "npm run dev:e2e",
            cwd: "../server",
            env: { ...process.env, DB_NAME: "clarity_e2e" },
            url: "http://localhost:3000/health",
            reuseExistingServer: false,
            timeout: 120_000,
        },
        {
            command: "npm run dev -- --port 5173 --strictPort",
            url: BASE_URL,
            reuseExistingServer: false,
            timeout: 120_000,
        },
    ],
});
