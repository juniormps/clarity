import { describe, expect, it } from "vitest";
import type { Task } from "../types/task";
import { getTaskStats } from "./getTaskStats";

function makeTask(id: number, completed: boolean): Task {
    return {
        id,
        title: `Tarefa ${id}`,
        completed,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
    };
}

describe("getTaskStats", () => {
    it("retorna zeros para lista vazia", () => {
        expect(getTaskStats([])).toEqual({
            total: 0,
            completed: 0,
            pending: 0,
            percentage: 0,
        });
    });

    it("conta somente pendentes", () => {
        const tasks = [makeTask(1, false), makeTask(2, false), makeTask(3, false)];

        expect(getTaskStats(tasks)).toEqual({
            total: 3,
            completed: 0,
            pending: 3,
            percentage: 0,
        });
    });

    it("conta mistura de pendentes e concluídas", () => {
        const tasks = [makeTask(1, true), makeTask(2, false), makeTask(3, false)];

        expect(getTaskStats(tasks)).toEqual({
            total: 3,
            completed: 1,
            pending: 2,
            percentage: 33,
        });
    });

    it("conta todas concluídas", () => {
        const tasks = [makeTask(1, true), makeTask(2, true)];

        expect(getTaskStats(tasks)).toEqual({
            total: 2,
            completed: 2,
            pending: 0,
            percentage: 100,
        });
    });

    it("arredonda o percentual para o inteiro mais próximo", () => {
        const tasks = [
            makeTask(1, true),
            makeTask(2, true),
            makeTask(3, false),
            makeTask(4, false),
            makeTask(5, false),
            makeTask(6, false),
            makeTask(7, false),
        ];

        expect(getTaskStats(tasks).percentage).toBe(29);
    });
});
