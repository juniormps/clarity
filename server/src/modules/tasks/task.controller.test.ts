import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../errors/AppError.js";
import type { Task } from "./task.types.js";
import {
    create,
    list,
    remove,
    removeCompleted,
    updateCompleted,
    updateTitle,
} from "./task.controller.js";
import * as taskService from "./task.service.js";

vi.mock("./task.service.js", () => ({
    createTask: vi.fn(),
    deleteCompletedTasks: vi.fn(),
    deleteTask: vi.fn(),
    listTasks: vi.fn(),
    updateTaskCompleted: vi.fn(),
    updateTaskTitle: vi.fn(),
}));

const mockedListTasks = vi.mocked(taskService.listTasks);
const mockedCreateTask = vi.mocked(taskService.createTask);
const mockedUpdateTaskCompleted = vi.mocked(taskService.updateTaskCompleted);
const mockedUpdateTaskTitle = vi.mocked(taskService.updateTaskTitle);
const mockedDeleteTask = vi.mocked(taskService.deleteTask);
const mockedDeleteCompletedTasks = vi.mocked(taskService.deleteCompletedTasks);

const existingTask: Task = {
    id: 1,
    title: "Estudar TypeScript",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function createRequest(overrides: Partial<Request> = {}): Request {
    return {
        body: {},
        params: {},
        ...overrides,
    } as Request;
}

function createMockResponse() {
    const json = vi.fn();
    const send = vi.fn();

    const res = {
        statusCode: 0,
        json,
        send,
        status(code: number) {
            res.statusCode = code;
            return res;
        },
    };

    return { res: res as unknown as Response, json, send };
}

describe("taskController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("list", () => {
        it("usa o userId de req.auth e responde 200 com { data: tasks }", async () => {
            mockedListTasks.mockResolvedValueOnce([existingTask]);

            const req = createRequest({ auth: { userId: 10 } });
            const { res, json } = createMockResponse();
            const next = vi.fn();

            await list(req, res, next);

            expect(mockedListTasks).toHaveBeenCalledWith(10);
            expect(res.statusCode).toBe(200);
            expect(json).toHaveBeenCalledWith({ data: [existingTask] });
            expect(next).not.toHaveBeenCalled();
        });

        it("encaminha erro de autenticação ausente para next", async () => {
            const req = createRequest();
            const { res } = createMockResponse();
            const next = vi.fn();

            await list(req, res, next);

            expect(mockedListTasks).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe("create", () => {
        it("usa o userId de req.auth e responde 201", async () => {
            mockedCreateTask.mockResolvedValueOnce(existingTask);

            const req = createRequest({
                auth: { userId: 10 },
                body: { title: "Estudar TypeScript" },
            });
            const { res, json } = createMockResponse();
            const next = vi.fn();

            await create(req, res, next);

            expect(mockedCreateTask).toHaveBeenCalledWith(10, { title: "Estudar TypeScript" });
            expect(res.statusCode).toBe(201);
            expect(json).toHaveBeenCalledWith({ data: existingTask });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("updateCompleted", () => {
        it("usa o userId de req.auth e responde 200", async () => {
            mockedUpdateTaskCompleted.mockResolvedValueOnce({ ...existingTask, completed: true });

            const req = createRequest({
                auth: { userId: 10 },
                params: { id: "1" },
                body: { completed: true },
            });
            const { res, json } = createMockResponse();
            const next = vi.fn();

            await updateCompleted(req, res, next);

            expect(mockedUpdateTaskCompleted).toHaveBeenCalledWith(10, "1", { completed: true });
            expect(res.statusCode).toBe(200);
            expect(json).toHaveBeenCalledWith({ data: { ...existingTask, completed: true } });
        });
    });

    describe("updateTitle", () => {
        it("usa o userId de req.auth e responde 200", async () => {
            mockedUpdateTaskTitle.mockResolvedValueOnce({ ...existingTask, title: "Novo título" });

            const req = createRequest({
                auth: { userId: 10 },
                params: { id: "1" },
                body: { title: "Novo título" },
            });
            const { res, json } = createMockResponse();
            const next = vi.fn();

            await updateTitle(req, res, next);

            expect(mockedUpdateTaskTitle).toHaveBeenCalledWith(10, "1", { title: "Novo título" });
            expect(res.statusCode).toBe(200);
            expect(json).toHaveBeenCalledWith({ data: { ...existingTask, title: "Novo título" } });
        });
    });

    describe("remove", () => {
        it("usa o userId de req.auth e responde 204", async () => {
            mockedDeleteTask.mockResolvedValueOnce(undefined);

            const req = createRequest({ auth: { userId: 10 }, params: { id: "1" } });
            const { res, send } = createMockResponse();
            const next = vi.fn();

            await remove(req, res, next);

            expect(mockedDeleteTask).toHaveBeenCalledWith(10, "1");
            expect(res.statusCode).toBe(204);
            expect(send).toHaveBeenCalled();
        });
    });

    describe("removeCompleted", () => {
        it("usa o userId de req.auth e responde 204", async () => {
            mockedDeleteCompletedTasks.mockResolvedValueOnce(undefined);

            const req = createRequest({ auth: { userId: 10 } });
            const { res, send } = createMockResponse();
            const next = vi.fn();

            await removeCompleted(req, res, next);

            expect(mockedDeleteCompletedTasks).toHaveBeenCalledWith(10);
            expect(res.statusCode).toBe(204);
            expect(send).toHaveBeenCalled();
        });
    });
});
