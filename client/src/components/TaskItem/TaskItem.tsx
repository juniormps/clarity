import type { Task } from "../../types/task";
import TaskEditForm from "../TaskEditForm/TaskEditForm";
import styles from "./TaskItem.module.css";

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

    if (isEditing) {
        return (
            <TaskEditForm
                task={task}
                isSaving={isEditingTitle}
                serverError={editError}
                itemClassName={styles.item}
                onSave={onUpdateTitle}
                onCancel={onCancelEdit}
                onClearServerError={onClearEditError}
            />
        );
    }

    return (
        <li className={styles.item}>
            <div className={styles.itemRow}>
                <span className={styles.title}>{task.title}</span>

                <div className={styles.actions}>
                    <span className={styles.status}>
                        {task.completed ? "Concluída" : "Pendente"}
                    </span>

                    <button
                        type="button"
                        className={styles.editButton}
                        aria-label={`Editar a tarefa "${task.title}"`}
                        disabled={isBusy}
                        onClick={handleStartEdit}
                    >
                        Editar
                    </button>

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
