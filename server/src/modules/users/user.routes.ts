import { Router } from "express";
import { registerRateLimiter } from "../../middlewares/rateLimiters.js";
import * as userController from "./user.controller.js";

export const userRoutes = Router();

//Cria um novo usuário. Protegido contra abuso de cadastro.
userRoutes.post("/", registerRateLimiter, userController.create);
