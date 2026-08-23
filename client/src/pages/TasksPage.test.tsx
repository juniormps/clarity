import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types/task";
import TasksPage from "./TasksPage";

vi.mock("../hooks/useTasks", () => ({
    useTasks: vi.fn(),
}));

vi.mock("../features/auth/LogoutButton", () => ({
    default: () => <button type="button">Sair mock</button>,
}));

const mockedUseTasks = vi.mocked(useTasks);

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

function mockUseTasksReturn(
    overrides: Partial<ReturnType<typeof useTasks>> = {},
): ReturnType<typeof useTasks> {
    return {
        tasks: [] as Task[],
        isLoadingTasks: false,
        error: null,
        isCreating: false,
        createError: null,
        createTask: vi.fn<(title: string) => Promise<Task>>(),
        clearCreateError: vi.fn<() => void>(),
        updatingCompletedTaskIds: new Set<number>(),
        updateCompletedErrors: {},
        updateTaskCompleted: vi.fn<(id: number, completed: boolean) => Promise<Task>>(),
        deletingTaskIds: new Set<number>(),
        deleteErrors: {},
        deleteTask: vi.fn<(id: number) => Promise<void>>(),
        isDeletingCompleted: false,
        deleteCompletedError: null,
        deleteCompletedTasks: vi.fn<() => Promise<void>>(),
        editingTaskIds: new Set<number>(),
        editError: null,
        updateTaskTitle: vi.fn<(id: number, title: string) => Promise<Task>>(),
        clearEditError: vi.fn<() => void>(),
        ...overrides,
    };
}

beforeEach(() => {
    mockedUseTasks.mockReset();
});

describe("TasksPage — filtro e busca combinados", () => {
    it("exibe todas as tarefas com filtro all e busca vazia", () => {
        mockedUseTasks.mockReturnValue(mockUseTasksReturn({ tasks }));

        render(<TasksPage />);

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.getByText("Estudar MySQL")).toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("exibe somente tarefas pendentes ao selecionar Pendentes", async () => {
        const user = userEvent.setup();
        mockedUseTasks.mockReturnValue(mockUseTasksReturn({ tasks }));

        render(<TasksPage />);

        await user.click(screen.getByRole("button", { name: "Pendentes" }));

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.queryByText("Revisar React")).not.toBeInTheDocument();
    });

    it("exibe somente tarefas concluídas ao selecionar Concluídas", async () => {
        const user = userEvent.setup();
        mockedUseTasks.mockReturnValue(mockUseTasksReturn({ tasks }));

        render(<TasksPage />);

        await user.click(screen.getByRole("button", { name: "Concluídas" }));

        expect(screen.queryByText("Estudar React")).not.toBeInTheDocument();
        expect(screen.getByText("Estudar MySQL")).toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("filtra por título ao pesquisar", async () => {
        const user = userEvent.setup();
        mockedUseTasks.mockReturnValue(mockUseTasksReturn({ tasks }));

        render(<TasksPage />);

        await user.type(screen.getByRole("searchbox"), "React");

        expect(screen.getByText("Estudar React")).toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });

    it("combina filtro Concluídas com busca React", async () => {
        const user = userEvent.setup();
        mockedUseTasks.mockReturnValue(mockUseTasksReturn({ tasks }));

        render(<TasksPage />);

        await user.click(screen.getByRole("button", { name: "Concluídas" }));
        await user.type(screen.getByRole("searchbox"), "React");

        expect(screen.queryByText("Estudar React")).not.toBeInTheDocument();
        expect(screen.queryByText("Estudar MySQL")).not.toBeInTheDocument();
        expect(screen.getByText("Revisar React")).toBeInTheDocument();
    });
});
