import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../../database/connection.js";
import type { CreateUserRepositoryInput, User } from "./user.types.js";

interface UserRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

function mapUserRow(row: UserRow): User {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}

//Identifica especificamente o erro MySQL de chave duplicada.
export function isDuplicateEntryError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === "ER_DUP_ENTRY"
    );
}

//Cria um novo usuário. Retorna null quando o email já está em uso.
export async function create(input: CreateUserRepositoryInput): Promise<User | null> {

    try {
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [input.name, input.email, input.passwordHash],
        );

        const insertId = result.insertId;

        const [rows] = await pool.execute<UserRow[]>(
            "SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?",
            [insertId],
        );

        if (rows.length === 0) {
            throw new Error("Failed to retrieve created user.");
        }

        return mapUserRow(rows[0]);
        
    } catch (error) {
        if (isDuplicateEntryError(error)) {
            return null;
        }

        throw error;
    }
}
