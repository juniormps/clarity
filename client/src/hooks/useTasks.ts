import { useEffect, useState } from "react";
import {
    createTask as createTaskRequest,
    deleteCompletedTasks as deleteCompletedTasksRequest,
    deleteTask as deleteTaskRequest,
    listTasks,
    updateTaskCompleted as updateTaskCompletedRequest,
    updateTaskTitle as updateTaskTitleRequest,
} from "../services/taskService";
import type { Task } from "../types/task";

export function useTasks() {
    // Estado das tarefas e do carregamento.
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado de criação de tarefa.
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Estado de atualização do status "completed" de cada tarefa.
    const [updatingCompletedTaskIds, setUpdatingCompletedTaskIds] = useState<Set<number>>(new Set());
    const [updateCompletedErrors, setUpdateCompletedErrors] = useState<Record<number, string>>({});

    // Estado de exclusão de cada tarefa.
    const [deletingTaskIds, setDeletingTaskIds] = useState<Set<number>>(new Set());
    const [deleteErrors, setDeleteErrors] = useState<Record<number, string>>({});

    // Estado de exclusão em massa das tarefas concluídas.
    const [isDeletingCompleted, setIsDeletingCompleted] = useState(false);
    const [deleteCompletedError, setDeleteCompletedError] = useState<string | null>(null);

    // Estado de edição do título de cada tarefa.
    const [editingTaskIds, setEditingTaskIds] = useState<Set<number>>(new Set());
    const [editError, setEditError] = useState<string | null>(null);

    // Carrega a lista de tarefas.
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await listTasks();
                if (!cancelled) {
                    setTasks(data);
                }
            } catch {
                if (!cancelled) {
                    setError("Não foi possível carregar as tarefas.");
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingTasks(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    // Cria uma nova tarefa.
    async function createTask(title: string): Promise<Task> {
        setIsCreating(true);
        setCreateError(null);

        try {
            const task = await createTaskRequest(title);
            setTasks((current) => [task, ...current]);
            return task;
        } catch (error) {
            setCreateError("Não foi possível criar a tarefa.");
            throw error;
        } finally {
            setIsCreating(false);
        }
    }

    // Limpa o erro de criação.
    function clearCreateError() {
        setCreateError(null);
    }

    // Atualiza o status completed de uma tarefa.
    async function updateTaskCompleted(id: number, completed: boolean): Promise<Task> {
        setUpdatingCompletedTaskIds((current) => new Set(current).add(id));
        setUpdateCompletedErrors((current) => {
            const next = { ...current };
            delete next[id];
            return next;
        });

        try {
            const updatedTask = await updateTaskCompletedRequest(id, completed);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;
        } catch (error) {
            setUpdateCompletedErrors((current) => ({
                ...current,
                [id]: "Não foi possível atualizar a tarefa.",
            }));
            throw error;
        } finally {
            setUpdatingCompletedTaskIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
        }
    }

    // Exclui uma tarefa.
    async function deleteTask(id: number): Promise<void> {
        setDeletingTaskIds((current) => new Set(current).add(id));
        setDeleteErrors((current) => {
            const next = { ...current };
            delete next[id];
            return next;
        });

        try {
            await deleteTaskRequest(id);
            setTasks((current) => current.filter((task) => task.id !== id));
        } catch (error) {
            setDeleteErrors((current) => ({
                ...current,
                [id]: "Não foi possível excluir a tarefa.",
            }));
            throw error;
        } finally {
            setDeletingTaskIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
        }
    }

    // Atualiza o título de uma tarefa.
    async function updateTaskTitle(id: number, title: string): Promise<Task> {
        setEditingTaskIds((current) => new Set(current).add(id));
        setEditError(null);

        try {
            const updatedTask = await updateTaskTitleRequest(id, title);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;
        } catch (error) {
            setEditError("Não foi possível editar o título da tarefa.");
            throw error;
        } finally {
            setEditingTaskIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
        }
    }

    // Limpa o erro de edição.
    function clearEditError() {
        setEditError(null);
    }

    // Exclui todas as tarefas concluídas.
    async function deleteCompletedTasks(): Promise<void> {

        setIsDeletingCompleted(true);
        setDeleteCompletedError(null);

        try {
            await deleteCompletedTasksRequest();
            setTasks((current) => current.filter((task) => !task.completed));

        } catch (error) {
            setDeleteCompletedError("Não foi possível limpar as tarefas concluídas.");
            throw error;

        } finally {
            setIsDeletingCompleted(false);
        }
    }

    return {
        tasks,
        isLoadingTasks,
        error,
        isCreating,
        createError,
        createTask,
        clearCreateError,
        updatingCompletedTaskIds,
        updateCompletedErrors,
        updateTaskCompleted,
        deletingTaskIds,
        deleteErrors,
        deleteTask,
        isDeletingCompleted,
        deleteCompletedError,
        deleteCompletedTasks,
        editingTaskIds,
        editError,
        updateTaskTitle,
        clearEditError,
    };
}
