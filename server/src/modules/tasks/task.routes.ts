import { Router } from "express";
import * as taskController from "./task.controller.js";

export const taskRoutes = Router();

taskRoutes.get("/", taskController.list);
taskRoutes.post("/", taskController.create);
