import { Router } from "express";
import * as taskController from "./task.controller.js";

export const taskRoutes = Router();

//Resgata todas as tarefas do banco de dados.
taskRoutes.get("/", taskController.list);

//Cria uma nova tarefa no banco de dados.
taskRoutes.post("/", taskController.create);
