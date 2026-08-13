import { Router } from "express";
import * as taskController from "./task.controller.js";

export const taskRoutes = Router();

//Resgata todas as tarefas do banco de dados.
taskRoutes.get("/", taskController.list);

//Cria uma nova tarefa no banco de dados.
taskRoutes.post("/", taskController.create);

//Atualiza o status completed de uma tarefa existente.
taskRoutes.patch("/:id", taskController.updateCompleted);

//Atualiza o título de uma tarefa existente.
taskRoutes.patch("/:id/title", taskController.updateTitle);

//Exclui uma tarefa existente.
taskRoutes.delete("/:id", taskController.remove);
