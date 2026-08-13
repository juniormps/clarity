import type { Request, Response } from "express";
import { createTask, deleteTask, listTasks, updateTaskCompleted } from "./task.service.js";

//Resgata todas as tarefas do banco de dados.
export async function list(_req: Request, res: Response): Promise<void> {
    try {
        const tasks = await listTasks();
        res.status(200).json({ data: tasks });
    } catch {
        res.status(500).json({ error: "Internal server error." });
    }
}

//Cria uma nova tarefa no banco de dados.
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const task = await createTask(req.body);
        res.status(201).json({ data: task });
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            "status" in err &&
            typeof (err as { status: number }).status === "number"
        ) {
            const status = (err as { status: number }).status;
            res.status(status).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Internal server error." });
    }
}

//Atualiza o status completed de uma tarefa existente.
export async function updateCompleted(req: Request, res: Response): Promise<void> {
    try {
        const task = await updateTaskCompleted(req.params.id, req.body);
        res.status(200).json({ data: task });
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            "status" in err &&
            typeof (err as { status: number }).status === "number"
        ) {
            const status = (err as { status: number }).status;
            res.status(status).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Internal server error." });
    }
}

//Exclui uma tarefa existente.
export async function remove(req: Request, res: Response): Promise<void> {

    try {
        await deleteTask(req.params.id);
        res.status(204).send();
        
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            "status" in err &&
            typeof (err as { status: number }).status === "number"
        ) {
            const status = (err as { status: number }).status;
            res.status(status).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Internal server error." });
    }
}
