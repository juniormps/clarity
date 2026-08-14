import { useEffect, useState } from "react";
import {
    createTask as createTaskRequest,
    deleteTask as deleteTaskRequest,
    listTasks,
    updateTaskCompleted as updateTaskCompletedRequest,
    updateTaskTitle as updateTaskTitleRequest,
} from "../services/taskService";
import type { Task } from "../types/task";

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [editErrorTaskId, setEditErrorTaskId] = useState<number | null>(null);

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
                    setIsLoading(false);
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

        setUpdatingTaskId(id);
        setUpdateError(null);

        try {
            const updatedTask = await updateTaskCompletedRequest(id, completed);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;

        } catch (error) {
            setUpdateError("Não foi possível atualizar a tarefa.");
            throw error;
            
        } finally {
            setUpdatingTaskId(null);
        }
    }

    // Exclui uma tarefa.
    async function deleteTask(id: number): Promise<void> {
        setDeletingTaskId(id);
        setDeleteError(null);

        try {
            await deleteTaskRequest(id);
            setTasks((current) => current.filter((task) => task.id !== id));

        } catch (error) {
            setDeleteError("Não foi possível excluir a tarefa.");
            throw error;
            
        } finally {
            setDeletingTaskId(null);
        }
    }

    // Atualiza o título de uma tarefa.
    async function updateTaskTitle(id: number, title: string): Promise<Task> {
        setEditingTaskId(id);
        setEditError(null);
        setEditErrorTaskId(null);

        try {
            const updatedTask = await updateTaskTitleRequest(id, title);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;
        } catch (error) {
            setEditError("Não foi possível editar o título da tarefa.");
            setEditErrorTaskId(id);
            throw error;
        } finally {
            setEditingTaskId(null);
        }
    }

    // Limpa o erro de edição quando ele pertence à tarefa indicada.
    function clearEditError(id: number) {
        if (editErrorTaskId !== id) {
            return;
        }

        setEditError(null);
        setEditErrorTaskId(null);
    }

    return {
        tasks,
        isLoading,
        error,
        isCreating,
        createError,
        createTask,
        clearCreateError,
        updatingTaskId,
        updateError,
        updateTaskCompleted,
        deletingTaskId,
        deleteError,
        deleteTask,
        editingTaskId,
        editError,
        editErrorTaskId,
        updateTaskTitle,
        clearEditError,
    };
}
