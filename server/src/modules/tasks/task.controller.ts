import type { NextFunction, Request, Response } from "express";
import {
    createTask,
    deleteCompletedTasks,
    deleteTask,
    listTasks,
    updateTaskCompleted,
    updateTaskTitle,
} from "./task.service.js";

//Resgata todas as tarefas do banco de dados.
export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const tasks = await listTasks();
        res.status(200).json({ data: tasks });
    } catch (error) {
        next(error);
    }
}

//Cria uma nova tarefa no banco de dados.
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const task = await createTask(req.body);
        res.status(201).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Atualiza o status completed de uma tarefa existente.
export async function updateCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const task = await updateTaskCompleted(req.params.id, req.body);
        res.status(200).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Atualiza o título de uma tarefa existente.
export async function updateTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const task = await updateTaskTitle(req.params.id, req.body);
        res.status(200).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Exclui uma tarefa existente.
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await deleteTask(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

//Exclui todas as tarefas concluídas.
export async function removeCompleted(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await deleteCompletedTasks();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
