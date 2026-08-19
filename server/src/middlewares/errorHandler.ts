import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction,
): void {
    
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    res.status(500).json({ error: "Internal server error." });
}
