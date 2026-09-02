import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { checkConnection } from "./database/connection.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { taskRoutes } from "./modules/tasks/task.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";

const app = express();

app.use(helmet());

//CORS: restringe requisições cross-origin à origem configurada do frontend.
//O fluxo normal de produção usa `/api` via proxy da Vercel, mas a política
//é mantida para proteger acessos diretos ao backend a partir de navegadores.
//Credenciais são permitidas apenas para a origem autorizada, e o middleware
//cors trata automaticamente as requisições OPTIONS de preflight.
app.use(
    cors({
        origin: [env.CLIENT_ORIGIN],
        credentials: true,
    }),
);

//Os payloads do Clarity são pequenos (nome, email, senha, título de até 140
//caracteres). Um limite de 10 KB é confortável e evita payloads excessivos.
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/health", async (_req, res) => {
    const dbConnected = await checkConnection();

    if (!dbConnected) {
        res.status(503).json({
            status: "error",
            database: "disconnected",
        });
        return;
    }

    res.json({
        status: "ok",
        database: "connected",
    });
});

//Fallback JSON para rotas de API inexistentes: mantém consistência e reduz
//o fingerprinting do Express. Não afeta o roteamento do cliente (Vite).
app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
});

app.use(errorHandler);

export { app };
