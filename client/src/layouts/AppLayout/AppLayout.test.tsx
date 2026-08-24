import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "../../hooks/useTasks";
import { makeTaskState } from "../../test/useTasksState";
import type { Task } from "../../types/task";
import type { AppLayoutOutletContext } from "./AppLayoutContext";
import AppLayout from "./AppLayout";

vi.mock("../../hooks/useTasks", () => ({
    useTasks: vi.fn(),
}));

vi.mock("../../features/auth/LogoutButton", () => ({
    default: () => <button type="button">Sair mock</button>,
}));

const mockedUseTasks = vi.mocked(useTasks);

const tasks: Task[] = [
    {
        id: 1,
        title: "Estudar React",
        completed: true,
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
        completed: false,
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
    },
];

function TasksProbe() {
    const { taskState, stats } = useOutletContext<AppLayoutOutletContext>();

    return <div>{`${taskState.tasks.length} tarefas; ${stats.pending} pendentes`}</div>;
}

function renderAppLayout() {
    return render(
        <MemoryRouter initialEntries={["/app"]}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/app" element={<TasksProbe />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mockedUseTasks.mockReset();
    mockedUseTasks.mockReturnValue(makeTaskState({ tasks }));
});

describe("AppLayout", () => {
    it("renderiza o conteúdo filho através do Outlet", () => {
        renderAppLayout();

        expect(screen.getByText("3 tarefas; 1 pendentes")).toBeInTheDocument();
    });

    it("chama useTasks uma única vez por renderização", () => {
        renderAppLayout();

        expect(mockedUseTasks).toHaveBeenCalledTimes(1);
    });

    it("compartilha o mesmo estado de tarefas entre Header e conteúdo", () => {
        renderAppLayout();

        expect(screen.getByRole("link", { name: "clarity" })).toBeInTheDocument();
        expect(screen.getByText("1 tarefa pendente")).toBeInTheDocument();
        expect(screen.getByText("3 tarefas; 1 pendentes")).toBeInTheDocument();
    });

    it("renderiza o skip link para o conteúdo principal", () => {
        renderAppLayout();

        expect(screen.getByRole("link", { name: "Ir para o conteúdo" })).toHaveAttribute(
            "href",
            "#conteudo-principal",
        );
    });
});
