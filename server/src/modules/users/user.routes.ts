import { Router } from "express";
import * as userController from "./user.controller.js";

export const userRoutes = Router();

//Cria um novo usuário.
userRoutes.post("/", userController.create);
