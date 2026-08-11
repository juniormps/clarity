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
    PORT: requireInt("PORT", process.env["PORT"] ?? "3000"),
    DB_HOST: requireEnv("DB_HOST"),
    DB_PORT: requireInt("DB_PORT", requireEnv("DB_PORT")),
    DB_USER: requireEnv("DB_USER"),
    DB_PASSWORD: requireEnv("DB_PASSWORD"),
    DB_NAME: requireEnv("DB_NAME"),
};
