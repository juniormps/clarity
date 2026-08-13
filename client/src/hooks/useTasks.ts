import { useEffect, useState } from "react";
import {
    createTask as createTaskRequest,
    listTasks,
    updateTaskCompleted as updateTaskCompletedRequest,
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
    };
}
