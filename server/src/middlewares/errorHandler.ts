import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

//Erros do body-parser (JSON malformado / payload grande demais) carregam um
//campo "type" que identifica a causa, permitindo responder com o status
//adequado sem expor detalhes internos.
interface BodyParserError {
    type?: unknown;
}

function isBodyParserError(error: unknown): error is BodyParserError {
    return (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        typeof (error as { type: unknown }).type === "string"
    );
}

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

    if (isBodyParserError(error)) {
        if (error.type === "entity.parse.failed") {
            res.status(400).json({ error: "Invalid JSON payload." });
            return;
        }

        if (error.type === "entity.too.large") {
            res.status(413).json({ error: "Payload too large." });
            return;
        }
    }

    res.status(500).json({ error: "Internal server error." });
}
