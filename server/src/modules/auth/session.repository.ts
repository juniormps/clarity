import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../../database/connection.js";
import type { User } from "../users/user.types.js";

export interface CreateSessionInput {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
}

interface SessionUserRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

function mapSessionUserRow(row: SessionUserRow): User {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}

//Cria uma sessão persistindo apenas o hash do token.
export async function createSession(input: CreateSessionInput): Promise<void> {
    await pool.execute(
        "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        [input.userId, input.tokenHash, input.expiresAt],
    );
}

//Recupera o usuário de uma sessão válida (não expirada) a partir do hash do token.
export async function findUserByTokenHash(tokenHash: string): Promise<User | null> {

    const [rows] = await pool.execute<SessionUserRow[]>(
        "SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, u.updated_at " +
            "FROM sessions s JOIN users u ON u.id = s.user_id " +
            "WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP LIMIT 1",
        [tokenHash],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapSessionUserRow(rows[0]);
}

//Remove somente a sessão correspondente ao hash do token.
export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    
    await pool.execute("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
}

//Remove todas as sessões cuja expiração já ocorreu.
export async function deleteExpiredSessions(): Promise<void> {
    await pool.execute("DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP");
}
