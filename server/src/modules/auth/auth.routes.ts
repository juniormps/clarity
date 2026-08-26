import { Router } from "express";
import { loginRateLimiter } from "../../middlewares/rateLimiters.js";
import * as authController from "./auth.controller.js";

export const authRoutes = Router();

//Autentica o usuário e cria uma sessão. Protegido contra brute force.
authRoutes.post("/login", loginRateLimiter, authController.login);

//Retorna o usuário da sessão atual.
authRoutes.get("/me", authController.me);

//Encerra a sessão atual.
authRoutes.post("/logout", authController.logout);
