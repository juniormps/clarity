import type { Task } from "../../types/task";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
    task: Task;
    isUpdating: boolean;
    onToggleCompleted: (id: number, completed: boolean) => void;
}

export function TaskItem({ task, isUpdating, onToggleCompleted }: TaskItemProps) {

    const nextCompleted = !task.completed;
    const actionLabel = task.completed ? "Reabrir" : "Concluir";

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
                    disabled={isUpdating}
                    onClick={() => onToggleCompleted(task.id, nextCompleted)}
                >
                    {isUpdating ? "Salvando..." : actionLabel}
                </button>
                
            </div>
        </li>
    );
}
