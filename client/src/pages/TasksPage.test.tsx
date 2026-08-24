import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { AppLayoutOutletContext } from "../layouts/AppLayout/AppLayoutContext";
import { makeTaskState } from "../test/useTasksState";
import type { Task } from "../types/task";
import { getTaskStats } from "../utils/getTaskStats";
import TasksPage from "./TasksPage";

const tasks: Task[] = [
    {
        id: 1,
        title: "Estudar React",
        completed: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: 2,
        title: "Estudar MySQL",
        completed: true,
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
    },
    {
        id: 3,
        title: "Revisar React",
        completed: true,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
    },
];

function renderTasksPage(taskList: Task[] = tasks) {
    const taskState = makeTaskState({ tasks: taskList });
    const context: AppLayoutOutletContext = {
        taskState,
        stats: getTaskStats(taskState.tasks),
    };

    return render(
        <MemoryRouter initialEntries={["/app"]}>
            <Routes>
                <Route element={<Outlet context={context} />}>
                    <Route path="/app" element={<TasksPage />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe("TasksPage — Workspace", () => {
    it("exibe o eyebrow Visão geral e o heading Minhas tarefas como h2", () => {
        renderTasksPage();

        expect(screen.getByText("Visão geral")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Minhas tarefas", level: 2 }),
        ).toBeInTheDocument();
    });

    it("exibe o resumo de pendentes e concluídas", () => {
        renderTasksPage();

        const summary = screen.getByLabelText("Resumo das tarefas");
        expect(summary).toHaveTextContent("1 pendente");
        expect(summary).toHaveTextContent("2 concluídas");
    });

    it("mantém filtros, busca, total e limpar concluídas", () => {
        renderTasksPage();

        expect(screen.getByRole("button", { name: "Todas" })).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Pendentes" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Concluídas" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("searchbox", { name: "Buscar tarefas" }),
        ).toBeInTheDocument();

        expect(screen.getByText("3 tarefas no total")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Limpar concluídas" }),
        ).toBeInTheDocument();
    });

    it("continua renderizando a lista de tarefas", () => {
        renderTasksPage();

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.getByText("Estudar MySQL")).toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });
});

describe("TasksPage — filtro e busca combinados", () => {
    it("exibe todas as tarefas com filtro all e busca vazia", () => {
        renderTasksPage();

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.getByText("Estudar MySQL")).toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("exibe somente tarefas pendentes ao selecionar Pendentes", async () => {
        const user = userEvent.setup();

        renderTasksPage();

        await user.click(screen.getByRole("button", { name: "Pendentes" }));

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.queryByText("Revisar React")).not.toBeInTheDocument();
    });

    it("exibe somente tarefas concluídas ao selecionar Concluídas", async () => {
        const user = userEvent.setup();

        renderTasksPage();

        await user.click(screen.getByRole("button", { name: "Concluídas" }));

        expect(screen.queryByText("Estudar React")).not.toBeInTheDocument();
        expect(screen.getByText("Estudar MySQL")).toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("filtra por título ao pesquisar", async () => {
        const user = userEvent.setup();

        renderTasksPage();

        await user.type(screen.getByRole("searchbox"), "React");

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("combina filtro Concluídas com busca React", async () => {
        const user = userEvent.setup();

        renderTasksPage();

        await user.click(screen.getByRole("button", { name: "Concluídas" }));
        await user.type(screen.getByRole("searchbox"), "React");

        expect(screen.queryByText("Estudar React")).not.toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });
});
