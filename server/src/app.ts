import express from "express";
import { checkConnection } from "./database/connection.js";

const app = express();

app.use(express.json());

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

export { app };
