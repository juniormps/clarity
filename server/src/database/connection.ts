import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
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
