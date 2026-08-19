import styles from "./ClearCompletedTasks.module.css";

interface ClearCompletedTasksProps {
    hasCompletedTasks: boolean;
    isDeleting: boolean;
    error: string | null;
    onDeleteCompleted: () => Promise<void>;
}

function ClearCompletedTasks({
    hasCompletedTasks,
    isDeleting,
    error,
    onDeleteCompleted,
}: ClearCompletedTasksProps) {
    
    // Solicita confirmação e, se confirmada, dispara a exclusão em massa.
    async function handleClick() {
        const confirmed = window.confirm(
            "Tem certeza de que deseja excluir todas as tarefas concluídas?",
        );

        if (!confirmed) {
            return;
        }

        try {
            await onDeleteCompleted();
        } catch {
            // A mensagem de erro é exibida pelo useTasks (deleteCompletedError).
        }
    }

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.button}
                disabled={!hasCompletedTasks || isDeleting}
                onClick={handleClick}
            >
                {isDeleting ? "Limpando..." : "Limpar concluídas"}
            </button>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default ClearCompletedTasks;
