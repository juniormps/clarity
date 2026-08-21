import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../../database/connection.js";
import type { CreateTaskInput, Task } from "./task.types.js";

interface TaskRow extends RowDataPacket {
    id: number;
    title: string;
    completed: number;
    created_at: Date;
    updated_at: Date;
}

function mapTaskRow(row: TaskRow): Task {
    return {
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}

//Resgata as tarefas pertencentes ao usuário autenticado.
export async function listAll(userId: number): Promise<Task[]> {
    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at " +
            "FROM tasks WHERE user_id = ? ORDER BY created_at DESC, id DESC",
        [userId],
    );

    return rows.map(mapTaskRow);
}

//Cria uma nova tarefa associada ao usuário autenticado.
export async function create(userId: number, input: CreateTaskInput): Promise<Task> {
    
    const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO tasks (user_id, title) VALUES (?, ?)",
        [userId, input.title],
    );

    const insertId = result.insertId;

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at " +
            "FROM tasks WHERE id = ? AND user_id = ?",
        [insertId, userId],
    );

    if (rows.length === 0) {
        throw new Error("Failed to retrieve created task.");
    }

    return mapTaskRow(rows[0]);
}

//Atualiza o status completed de uma tarefa do usuário e retorna o estado persistido.
export async function updateCompleted(
    userId: number,
    id: number,
    completed: boolean,
): Promise<Task | null> {

    await pool.execute(
        "UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?",
        [completed, id, userId],
    );

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at " +
            "FROM tasks WHERE id = ? AND user_id = ?",
        [id, userId],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapTaskRow(rows[0]);
}

//Atualiza o título de uma tarefa do usuário e retorna o estado persistido.
export async function updateTitle(
    userId: number,
    id: number,
    title: string,
): Promise<Task | null> {

    await pool.execute(
        "UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?",
        [title, id, userId],
    );

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at " +
            "FROM tasks WHERE id = ? AND user_id = ?",
        [id, userId],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapTaskRow(rows[0]);
}

//Exclui uma tarefa do usuário pelo id e informa se alguma linha foi realmente removida.
export async function deleteById(userId: number, id: number): Promise<boolean> {
    
    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [id, userId],
    );

    return result.affectedRows > 0;
}

//Exclui as tarefas concluídas do usuário e informa a quantidade de linhas removidas.
export async function deleteCompleted(userId: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM tasks WHERE user_id = ? AND completed = TRUE",
        [userId],
    );

    return result.affectedRows;
}
