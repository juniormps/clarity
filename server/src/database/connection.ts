import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export function buildSslConfig(
    caPath: string | undefined,
): { ssl: { ca: string } } | undefined {
    if (!caPath) {
        return undefined;
    }

    return {
        ssl: {
            ca: readFileSync(caPath, "utf8"),
        },
    };
}

const ssl = buildSslConfig(env.DB_SSL_CA_PATH);

export const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ...ssl,
});

export async function checkConnection(): Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        connection.release();
        return true;
    } catch {
        return false;
    }
}
