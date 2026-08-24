import type { Task } from "../types/task";

export interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
}

// Calcula as estatísticas derivadas de uma lista de tarefas.
export function getTaskStats(tasks: readonly Task[]): TaskStats {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, pending, percentage };
}
