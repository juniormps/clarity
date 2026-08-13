import type { Task } from "../../types/task";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
    task: Task;
    isUpdating: boolean;
    isDeleting: boolean;
    onToggleCompleted: (id: number, completed: boolean) => Promise<Task>;
    onDelete: (id: number) => Promise<void>;
}

export function TaskItem({
    task,
    isUpdating,
    isDeleting,
    onToggleCompleted,
    onDelete,
}: TaskItemProps) {

    const nextCompleted = !task.completed;
    const actionLabel = task.completed ? "Reabrir" : "Concluir";
    const isBusy = isUpdating || isDeleting;

    async function handleToggleCompleted() {

        try {
            await onToggleCompleted(task.id, nextCompleted);
        } catch {
            // A mensagem de erro é exibida pelo useTasks (updateError).
        }
    }

    async function handleDelete() {
        
        const confirmed = window.confirm(
            "Tem certeza de que deseja excluir esta tarefa?",
        );

        if (!confirmed) {
            return;
        }

        try {
            await onDelete(task.id);
        } catch {
            // A mensagem de erro é exibida pelo useTasks (deleteError).
        }
    }

    return (
        <li className={styles.item}>
            <span className={styles.title}>{task.title}</span>

            <div className={styles.actions}>

                <span className={styles.status}>
                    {task.completed ? "Concluída" : "Pendente"}
                </span>

                <button
                    type="button"
                    className={styles.toggleButton}
                    aria-pressed={task.completed}
                    aria-label={`${actionLabel} a tarefa "${task.title}"`}
                    disabled={isBusy}
                    onClick={handleToggleCompleted}
                >
                    {isUpdating ? "Salvando..." : actionLabel}
                </button>

                <button
                    type="button"
                    className={styles.deleteButton}
                    aria-label={`Excluir a tarefa "${task.title}"`}
                    disabled={isBusy}
                    onClick={handleDelete}
                >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                </button>

            </div>
        </li>
    );
}
