import express from "express";
import { checkConnection } from "./database/connection.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { taskRoutes } from "./modules/tasks/task.routes.js";

const app = express();

app.use(express.json());

app.use("/api/tasks", taskRoutes);

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

app.use(errorHandler);

export { app };
