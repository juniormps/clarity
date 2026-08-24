import type { Task } from "../../types/task";
import TaskEditForm from "../TaskEditForm/TaskEditForm";
import styles from "./TaskItem.module.css";

// Formatador de data criado uma única vez em escopo de módulo.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
});

interface TaskItemProps {
    task: Task;
    isUpdating: boolean;
    isDeleting: boolean;
    isEditingTitle: boolean;
    isEditing: boolean;
    editError: string | null;
    updateError: string | null;
    deleteError: string | null;
    onToggleCompleted: (id: number, completed: boolean) => Promise<Task>;
    onDelete: (id: number) => Promise<void>;
    onUpdateTitle: (id: number, title: string) => Promise<Task>;
    onClearEditError: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
}

function TaskItem({
    task,
    isUpdating,
    isDeleting,
    isEditingTitle,
    isEditing,
    editError,
    updateError,
    deleteError,
    onToggleCompleted,
    onDelete,
    onUpdateTitle,
    onClearEditError,
    onStartEdit,
    onCancelEdit,
}: TaskItemProps) {
    
    const nextCompleted = !task.completed;
    const actionLabel = task.completed ? "Reabrir" : "Concluir";
    const isBusy = isUpdating || isDeleting || isEditingTitle;

    // Função para alternar o status completed da tarefa.
    async function handleToggleCompleted() {
        try {
            await onToggleCompleted(task.id, nextCompleted);
        } catch {
            // A mensagem de erro é exibida pelo useTasks (updateCompletedError).
        }
    }

    // Função para excluir a tarefa.
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

    // Função para iniciar a edição do título da tarefa.
    function handleStartEdit() {
        onClearEditError();
        onStartEdit();
    }

    const itemClassName = task.completed
        ? `${styles.item} ${styles.completed}`
        : styles.item;

    if (isEditing) {
        return (
            <TaskEditForm
                task={task}
                isSaving={isEditingTitle}
                serverError={editError}
                itemClassName={itemClassName}
                onSave={onUpdateTitle}
                onCancel={onCancelEdit}
                onClearServerError={onClearEditError}
            />
        );
    }

    return (
        <li className={itemClassName}>
            <div className={styles.itemRow}>
                <button
                    type="button"
                    className={styles.toggleButton}
                    aria-pressed={task.completed}
                    aria-label={`${actionLabel} a tarefa "${task.title}"`}
                    aria-busy={isUpdating || undefined}
                    disabled={isBusy}
                    onClick={handleToggleCompleted}
                >
                    <span className={styles.checkboxVisual} aria-hidden="true">
                        {task.completed && (
                            <svg aria-hidden="true" viewBox="0 0 24 24">
                                <path d="m6 12 4 4 8-9" />
                            </svg>
                        )}
                    </span>
                </button>

                <div className={styles.copy}>
                    <span className={styles.title}>{task.title}</span>

                    <time className={styles.date} dateTime={task.createdAt}>
                        {dateFormatter.format(new Date(task.createdAt))}
                    </time>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`Editar a tarefa "${task.title}"`}
                        disabled={isBusy}
                        onClick={handleStartEdit}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        aria-label={`Excluir a tarefa "${task.title}"`}
                        disabled={isBusy}
                        onClick={handleDelete}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                        </svg>
                    </button>
                </div>
            </div>

            {(updateError || deleteError) && (
                <p className={styles.itemError} role="alert">
                    {updateError ?? deleteError}
                </p>
            )}
        </li>
    );
}

export default TaskItem;
