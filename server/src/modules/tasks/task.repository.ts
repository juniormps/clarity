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

//Resgata todas as tarefas do banco de dados.
export async function listAll(): Promise<Task[]> {
    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC, id DESC",
    );

    return rows.map(mapTaskRow);
}

//Cria uma nova tarefa no banco de dados.
export async function create(input: CreateTaskInput): Promise<Task> {
    
    const [result] = await pool.execute<ResultSetHeader>("INSERT INTO tasks (title) VALUES (?)", [input.title]);

    const insertId = result.insertId;

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
        [insertId],
    );

    if (rows.length === 0) {
        throw new Error("Failed to retrieve created task.");
    }

    return mapTaskRow(rows[0]);
}

//Atualiza o status completed de uma tarefa e retorna o estado persistido.
export async function updateCompleted(id: number, completed: boolean): Promise<Task | null> {

    await pool.execute("UPDATE tasks SET completed = ? WHERE id = ?", [completed, id]);

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
        [id],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapTaskRow(rows[0]);
}

//Atualiza o título de uma tarefa e retorna o estado persistido.
export async function updateTitle(id: number, title: string): Promise<Task | null> {

    await pool.execute("UPDATE tasks SET title = ? WHERE id = ?", 
        [title, id]
    );

    const [rows] = await pool.execute<TaskRow[]>(
        "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
        [id],
    );

    if (rows.length === 0) {
        return null;
    }

    return mapTaskRow(rows[0]);
}

//Exclui uma tarefa pelo id e informa se alguma linha foi realmente removida.
export async function deleteById(id: number): Promise<boolean> {
    
    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM tasks WHERE id = ?",
        [id],
    );

    return result.affectedRows > 0;
}
