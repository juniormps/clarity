import { describe, expect, it } from "vitest";
import { AppError } from "./AppError.js";

describe("AppError", () => {
    it("é uma instância de Error", () => {
        const error = new AppError(400, "Bad request");
        expect(error).toBeInstanceOf(Error);
    });

    it("preserva o statusCode informado", () => {
        const error = new AppError(404, "Not found");
        expect(error.statusCode).toBe(404);
    });

    it("preserva a mensagem informada", () => {
        const error = new AppError(422, "Invalid input");
        expect(error.message).toBe("Invalid input");
    });

    it("define name como AppError", () => {
        const error = new AppError(500, "Internal error");
        expect(error.name).toBe("AppError");
    });
});
