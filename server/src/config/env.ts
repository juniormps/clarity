import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, "..", "..", "..", ".env") });

function requireEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${key}. ` +
                "Check your .env file at the project root.",
        );
    }

    return value;
}

const NODE_ENV_VALUES = ["development", "test", "production"] as const;

export type NodeEnv = (typeof NODE_ENV_VALUES)[number];

//Valida NODE_ENV. O default "development" preserva a execução local sem
//exigir configuração extra; em produção o valor deve ser informado
//explicitamente (ex.: NODE_ENV=production node dist/server.js), pois é o
//que determina o cookie Secure.
function resolveNodeEnv(): NodeEnv {
    const raw = process.env["NODE_ENV"];

    if (raw === undefined || raw === "") {
        return "development";
    }

    if (NODE_ENV_VALUES.includes(raw as NodeEnv)) {
        return raw as NodeEnv;
    }

    throw new Error(
        `Invalid NODE_ENV: "${raw}". ` +
            `Expected one of: ${NODE_ENV_VALUES.join(", ")}.`,
    );
}

function requireInt(label: string, raw: string): number {
    if (!/^\d+$/.test(raw)) {
        throw new Error(
            `Invalid numeric value for ${label}: "${raw}". ` +
                "Check your .env file at the project root.",
        );
    }

    const parsed = Number(raw);

    if (parsed <= 0 || parsed > 65535) {
        throw new Error(
            `${label} must be between 1 and 65535. ` +
                "Check your .env file at the project root.",
        );
    }

    return parsed;
}

export const env = {
    NODE_ENV: resolveNodeEnv(),
    PORT: requireInt("PORT", process.env["PORT"] ?? "3000"),
    DB_HOST: requireEnv("DB_HOST"),
    DB_PORT: requireInt("DB_PORT", requireEnv("DB_PORT")),
    DB_USER: requireEnv("DB_USER"),
    DB_PASSWORD: requireEnv("DB_PASSWORD"),
    DB_NAME: requireEnv("DB_NAME"),
};
