import { Router } from "express";
import * as authController from "./auth.controller.js";

export const authRoutes = Router();

//Autentica o usuário e cria uma sessão.
authRoutes.post("/login", authController.login);

//Retorna o usuário da sessão atual.
authRoutes.get("/me", authController.me);

//Encerra a sessão atual.
authRoutes.post("/logout", authController.logout);
