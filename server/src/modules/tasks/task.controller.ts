import type { Request, Response } from "express";
import { createTask } from "./task.service.js";

export async function create(req: Request, res: Response): Promise<void> {
    try {
        const task = await createTask(req.body);
        res.status(201).json({ data: task });
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            "status" in err &&
            typeof (err as { status: number }).status === "number"
        ) {
            const status = (err as { status: number }).status;
            res.status(status).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Internal server error." });
    }
}
