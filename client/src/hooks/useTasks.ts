import { useEffect, useRef, useState } from "react";
import { isUnauthorizedError } from "../services/httpError";
import {
    createTask as createTaskRequest,
    deleteCompletedTasks as deleteCompletedTasksRequest,
    deleteTask as deleteTaskRequest,
    listTasks,
    updateTaskCompleted as updateTaskCompletedRequest,
    updateTaskTitle as updateTaskTitleRequest,
} from "../services/taskService";
import type { Task } from "../types/task";

interface LoadState {
    isLoading: boolean;
    error: string | null;
}

interface CreateState {
    isCreating: boolean;
    error: string | null;
}

interface PerTaskOperationState {
    taskIds: Set<number>;
    errors: Record<number, string>;
}

interface DeleteCompletedState {
    isDeleting: boolean;
    error: string | null;
}

interface EditState {
    taskIds: Set<number>;
    error: string | null;
}

function addTaskId(current: Set<number>, id: number): Set<number> {
    return new Set(current).add(id);
}

function removeTaskId(current: Set<number>, id: number): Set<number> {
    const next = new Set(current);
    next.delete(id);
    return next;
}

function removeTaskError(current: Record<number, string>, id: number): Record<number, string> {
    const next = { ...current };
    delete next[id];
    return next;
}

export function useTasks(onUnauthorized?: () => void) {
    //Guarda o callback em uma ref para que a detecção de sessão inválida
    //não exija reexecutar o efeito de carregamento da lista.
    const onUnauthorizedRef = useRef(onUnauthorized);

    useEffect(() => {
        onUnauthorizedRef.current = onUnauthorized;
    }, [onUnauthorized]);

    //Sinaliza a expiração da sessão quando uma API protegida retorna 401.
    function handleUnauthorized(error: unknown): void {
        if (isUnauthorizedError(error)) {
            onUnauthorizedRef.current?.();
        }
    }

    // Estado das tarefas.
    const [tasks, setTasks] = useState<Task[]>([]);

    // Estado de carregamento da lista de tarefas.
    const [loadState, setLoadState] = useState<LoadState>({
        isLoading: true,
        error: null,
    });

    // Estado de criação de tarefa.
    const [createState, setCreateState] = useState<CreateState>({
        isCreating: false,
        error: null,
    });

    // Estado de atualização do status "completed" de cada tarefa.
    const [updateCompletedState, setUpdateCompletedState] = useState<PerTaskOperationState>({
        taskIds: new Set(),
        errors: {},
    });

    // Estado de exclusão de cada tarefa.
    const [deleteState, setDeleteState] = useState<PerTaskOperationState>({
        taskIds: new Set(),
        errors: {},
    });

    // Estado de exclusão em massa das tarefas concluídas.
    const [deleteCompletedState, setDeleteCompletedState] = useState<DeleteCompletedState>({
        isDeleting: false,
        error: null,
    });

    // Estado de edição do título de cada tarefa.
    const [editState, setEditState] = useState<EditState>({
        taskIds: new Set(),
        error: null,
    });

    // Carrega a lista de tarefas.
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await listTasks();
                if (!cancelled) {
                    setTasks(data);
                }
            } catch (error) {
                if (!cancelled) {
                    handleUnauthorized(error);
                    setLoadState((current) => ({
                        ...current,
                        error: "Não foi possível carregar as tarefas.",
                    }));
                }
            } finally {
                if (!cancelled) {
                    setLoadState((current) => ({ ...current, isLoading: false }));
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
        setCreateState({ 
            isCreating: true, 
            error: null 
        });

        try {
            const task = await createTaskRequest(title);
            setTasks((current) => [task, ...current]);
            return task;
            
        } catch (error) {
            handleUnauthorized(error);
            setCreateState((current) => ({
                ...current,
                error: "Não foi possível criar a tarefa.",
            }));
            throw error;

        } finally {
            setCreateState((current) => ({ 
                ...current, 
                isCreating: false 
            }));
        }
    }

    // Limpa o erro de criação.
    function clearCreateError() {
        setCreateState((current) => ({ ...current, error: null }));
    }

    // Atualiza o status completed de uma tarefa.
    async function updateTaskCompleted(id: number, completed: boolean): Promise<Task> {
        setUpdateCompletedState((current) => ({
            taskIds: addTaskId(current.taskIds, id),
            errors: removeTaskError(current.errors, id),
        }));

        try {
            const updatedTask = await updateTaskCompletedRequest(id, completed);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;
        } catch (error) {
            handleUnauthorized(error);
            setUpdateCompletedState((current) => ({
                ...current,
                errors: {
                    ...current.errors,
                    [id]: "Não foi possível atualizar a tarefa.",
                },
            }));
            throw error;
        } finally {
            setUpdateCompletedState((current) => ({
                ...current,
                taskIds: removeTaskId(current.taskIds, id),
            }));
        }
    }

    // Exclui uma tarefa.
    async function deleteTask(id: number): Promise<void> {
        setDeleteState((current) => ({
            taskIds: addTaskId(current.taskIds, id),
            errors: removeTaskError(current.errors, id),
        }));

        try {
            await deleteTaskRequest(id);
            setTasks((current) => current.filter((task) => task.id !== id));
        } catch (error) {
            handleUnauthorized(error);
            setDeleteState((current) => ({
                ...current,
                errors: {
                    ...current.errors,
                    [id]: "Não foi possível excluir a tarefa.",
                },
            }));
            throw error;
        } finally {
            setDeleteState((current) => ({
                ...current,
                taskIds: removeTaskId(current.taskIds, id),
            }));
        }
    }

    // Atualiza o título de uma tarefa.
    async function updateTaskTitle(id: number, title: string): Promise<Task> {
        setEditState((current) => ({
            taskIds: addTaskId(current.taskIds, id),
            error: null,
        }));

        try {
            const updatedTask = await updateTaskTitleRequest(id, title);
            setTasks((current) =>
                current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
            );
            return updatedTask;
        } catch (error) {
            handleUnauthorized(error);
            setEditState((current) => ({
                ...current,
                error: "Não foi possível editar o título da tarefa.",
            }));
            throw error;
        } finally {
            setEditState((current) => ({
                ...current,
                taskIds: removeTaskId(current.taskIds, id),
            }));
        }
    }

    // Limpa o erro de edição.
    function clearEditError() {
        setEditState((current) => ({ ...current, error: null }));
    }

    // Exclui todas as tarefas concluídas.
    async function deleteCompletedTasks(): Promise<void> {
        setDeleteCompletedState({ isDeleting: true, error: null });

        try {
            await deleteCompletedTasksRequest();
            setTasks((current) => current.filter((task) => !task.completed));
        } catch (error) {
            handleUnauthorized(error);
            setDeleteCompletedState((current) => ({
                ...current,
                error: "Não foi possível limpar as tarefas concluídas.",
            }));
            throw error;
        } finally {
            setDeleteCompletedState((current) => ({ ...current, isDeleting: false }));
        }
    }

    return {
        tasks,
        isLoadingTasks: loadState.isLoading,
        error: loadState.error,
        isCreating: createState.isCreating,
        createError: createState.error,
        createTask,
        clearCreateError,
        updatingCompletedTaskIds: updateCompletedState.taskIds,
        updateCompletedErrors: updateCompletedState.errors,
        updateTaskCompleted,
        deletingTaskIds: deleteState.taskIds,
        deleteErrors: deleteState.errors,
        deleteTask,
        isDeletingCompleted: deleteCompletedState.isDeleting,
        deleteCompletedError: deleteCompletedState.error,
        deleteCompletedTasks,
        editingTaskIds: editState.taskIds,
        editError: editState.error,
        updateTaskTitle,
        clearEditError,
    };
}
