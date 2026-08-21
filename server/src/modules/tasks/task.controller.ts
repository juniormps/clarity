import type { NextFunction, Request, Response } from "express";
import { getAuthUserId } from "../../middlewares/getAuthUserId.js";
import {
    createTask,
    deleteCompletedTasks,
    deleteTask,
    listTasks,
    updateTaskCompleted,
    updateTaskTitle,
} from "./task.service.js";

//Resgata as tarefas do usuário autenticado.
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        const tasks = await listTasks(userId);
        res.status(200).json({ data: tasks });
    } catch (error) {
        next(error);
    }
}

//Cria uma nova tarefa associada ao usuário autenticado.
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        const task = await createTask(userId, req.body);
        res.status(201).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Atualiza o status completed de uma tarefa do usuário autenticado.
export async function updateCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        const task = await updateTaskCompleted(userId, req.params.id, req.body);
        res.status(200).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Atualiza o título de uma tarefa do usuário autenticado.
export async function updateTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        const task = await updateTaskTitle(userId, req.params.id, req.body);
        res.status(200).json({ data: task });
    } catch (error) {
        next(error);
    }
}

//Exclui uma tarefa do usuário autenticado.
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        await deleteTask(userId, req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

//Exclui as tarefas concluídas do usuário autenticado.
export async function removeCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = getAuthUserId(req);
        await deleteCompletedTasks(userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
