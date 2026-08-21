import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../../database/connection.js";
import type { CreateUserRepositoryInput, User, UserAuthenticationRecord } from "./user.types.js";

interface UserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

interface UserAuthenticationRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

function mapUserRow(row: UserRow): User {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}

function mapUserAuthenticationRow(row: UserAuthenticationRow): UserAuthenticationRecord {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        passwordHash: row.password_hash,
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

//Busca um usuário por email incluindo o hash da senha, apenas para autenticação.
export async function findByEmailForAuthentication(
    email: string,
): Promise<UserAuthenticationRecord | null> {
    
    const [rows] = await pool.execute<UserAuthenticationRow[]>(
        "SELECT id, first_name, last_name, email, password_hash, created_at, updated_at " +
            "FROM users WHERE email = ?",
        [email],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapUserAuthenticationRow(rows[0]);
}

//Cria um novo usuário. Retorna null quando o email já está em uso.
export async function create(input: CreateUserRepositoryInput): Promise<User | null> {
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
            [input.firstName, input.lastName, input.email, input.passwordHash],
        );

        const insertId = result.insertId;

        const [rows] = await pool.execute<UserRow[]>(
            "SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?",
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
