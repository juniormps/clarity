import { describe, expect, it } from "vitest";
import {
    validateCreateTaskInput,
    validateTaskId,
    validateUpdateTaskCompletedInput,
    validateUpdateTaskTitleInput,
} from "./task.validation.js";

describe("validateCreateTaskInput", () => {
    it("rejeita body ausente ou null", () => {
        expect(validateCreateTaskInput(undefined)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
        expect(validateCreateTaskInput(null)).toEqual({
            valid: false,
            error: "Request body is required.",
        });
    });

    it("rejeita body que não seja um objeto JSON", () => {
        expect(validateCreateTaskInput("texto")).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
        expect(validateCreateTaskInput([])).toEqual({
            valid: false,
            error: "Request body must be a JSON object.",
        });
    });

    it("rejeita quando title está ausente", () => {
        expect(validateCreateTaskInput({})).toEqual({
            valid: false,
            error: '"title" is required.',
        });
    });

    it("rejeita title que não seja string", () => {
        expect(validateCreateTaskInput({ title: 42 })).toEqual({
            valid: false,
            error: '"title" must be a string.',
        });
    });

    it("rejeita título vazio ou apenas com espaços", () => {
        expect(validateCreateTaskInput({ title: "" })).toEqual({
            valid: false,
            error: '"title" cannot be empty.',
        });
        expect(validateCreateTaskInput({ title: "   " })).toEqual({
            valid: false,
            error: '"title" cannot be empty.',
        });
    });

    it("rejeita título acima de 140 caracteres", () => {
        expect(validateCreateTaskInput({ title: "a".repeat(141) })).toEqual({
            valid: false,
            error: '"title" must be at most 140 characters.',
        });
    });

    it("aceita título válido", () => {
        expect(validateCreateTaskInput({ title: "Estudar React" })).toEqual({
            valid: true,
            data: { title: "Estudar React" },
        });
    });

    it("remove espaços das extremidades do título válido", () => {
        expect(validateCreateTaskInput({ title: "  Estudar React  " })).toEqual({
            valid: true,
            data: { title: "Estudar React" },
        });
    });
});

describe("validateTaskId", () => {
    it("aceita inteiro positivo válido", () => {
        expect(validateTaskId("42")).toEqual({ valid: true, data: 42 });
    });

    it("rejeita zero", () => {
        expect(validateTaskId("0")).toEqual({
            valid: false,
            error: "Task id must be a positive integer.",
        });
    });

    it("rejeita valor negativo", () => {
        expect(validateTaskId("-1")).toEqual({
            valid: false,
            error: "Task id must be a positive integer.",
        });
    });

    it("rejeita decimal", () => {
        expect(validateTaskId("1.5")).toEqual({
            valid: false,
            error: "Task id must be a positive integer.",
        });
    });

    it("rejeita texto não numérico", () => {
        expect(validateTaskId("abc")).toEqual({
            valid: false,
            error: "Task id must be a positive integer.",
        });
    });

    it("rejeita valor que ultrapasse um inteiro seguro", () => {
        expect(validateTaskId("9007199254740993")).toEqual({
            valid: false,
            error: "Task id must be a positive integer.",
        });
    });
});

describe("validateUpdateTaskCompletedInput", () => {
    it("rejeita quando completed está ausente", () => {
        expect(validateUpdateTaskCompletedInput({})).toEqual({
            valid: false,
            error: '"completed" is required.',
        });
    });

    it("rejeita completed que não seja boolean", () => {
        expect(validateUpdateTaskCompletedInput({ completed: "true" })).toEqual({
            valid: false,
            error: '"completed" must be a boolean.',
        });
    });

    it("aceita completed: true", () => {
        expect(validateUpdateTaskCompletedInput({ completed: true })).toEqual({
            valid: true,
            data: { completed: true },
        });
    });

    it("aceita completed: false", () => {
        expect(validateUpdateTaskCompletedInput({ completed: false })).toEqual({
            valid: true,
            data: { completed: false },
        });
    });
});

describe("validateUpdateTaskTitleInput", () => {
    it("rejeita quando title está ausente", () => {
        expect(validateUpdateTaskTitleInput({})).toEqual({
            valid: false,
            error: '"title" is required.',
        });
    });

    it("rejeita título vazio", () => {
        expect(validateUpdateTaskTitleInput({ title: "" })).toEqual({
            valid: false,
            error: '"title" cannot be empty.',
        });
    });

    it("rejeita título maior que 140 caracteres", () => {
        expect(validateUpdateTaskTitleInput({ title: "a".repeat(141) })).toEqual({
            valid: false,
            error: '"title" must be at most 140 characters.',
        });
    });

    it("aceita título válido", () => {
        expect(validateUpdateTaskTitleInput({ title: "Estudar MySQL" })).toEqual({
            valid: true,
            data: { title: "Estudar MySQL" },
        });
    });

    it("normaliza o título removendo espaços das extremidades", () => {
        expect(validateUpdateTaskTitleInput({ title: "  Estudar MySQL  " })).toEqual({
            valid: true,
            data: { title: "Estudar MySQL" },
        });
    });
});
