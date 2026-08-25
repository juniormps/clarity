import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Diretório raiz do projeto, resolvido a partir deste arquivo para não
// depender do diretório de trabalho no momento da execução.
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");

dotenv.config({ path: join(PROJECT_ROOT, ".env") });

// Banco dedicado exclusivamente aos testes E2E. O nome pode ser sobrescrito
// via E2E_DB_NAME, mas SEMPRE precisa ser um banco terminado em "_e2e".
const E2E_DB_NAME = process.env["E2E_DB_NAME"] ?? "clarity_e2e";

const MIGRATIONS_DIR = join(PROJECT_ROOT, "database", "migrations");

const IDENTIFIER_PATTERN = /^[a-z0-9_]+$/i;

//Guarda de segurança contra exclusão acidental do banco de desenvolvimento.
//Operações destrutivas só são permitidas em bancos reconhecidamente E2E.
function assertE2EDatabaseName(name: string): void {
    const isValidIdentifier = IDENTIFIER_PATTERN.test(name);
    const isE2EConvention = name.endsWith("_e2e");

    if (!isValidIdentifier || !isE2EConvention) {
        throw new Error(
            `Refusing to reset database "${name}". ` +
                "Only databases named with the \"_e2e\" suffix (e.g. \"clarity_e2e\") " +
                "may be dropped and recreated by the E2E setup.",
        );
    }
}

//Lê uma variável obrigatória do ambiente (carregada do .env do projeto).
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

//Recria o banco E2E e aplica, em ordem, todas as migrations existentes.
async function main(): Promise<void> {
    assertE2EDatabaseName(E2E_DB_NAME);

    const host = requireEnv("DB_HOST");
    const port = Number(requireEnv("DB_PORT"));
    const user = requireEnv("DB_USER");
    const password = requireEnv("DB_PASSWORD");

    const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        multipleStatements: true,
    });

    try {
        await connection.query(`DROP DATABASE IF EXISTS \`${E2E_DB_NAME}\``);
        await connection.query(`CREATE DATABASE \`${E2E_DB_NAME}\``);
        await connection.query(`USE \`${E2E_DB_NAME}\``);

        const migrationFiles = readdirSync(MIGRATIONS_DIR)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of migrationFiles) {
            const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
            await connection.query(sql);
        }

        console.log(
            `E2E database "${E2E_DB_NAME}" reset with ${migrationFiles.length} migrations.`,
        );
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
