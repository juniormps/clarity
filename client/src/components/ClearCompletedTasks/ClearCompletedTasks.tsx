import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Abre o modal de confirmação antes da exclusão em massa.
    function handleOpenModal() {
        setIsModalOpen(true);
    }

    // Executa a exclusão em massa após a confirmação do usuário.
    async function handleConfirmDelete() {
        setIsModalOpen(false);

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
                onClick={handleOpenModal}
            >
                {isDeleting ? "Limpando..." : "Limpar concluídas"}
            </button>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Excluir tarefas concluídas?"
                message="Tem certeza de que deseja excluir todas as tarefas concluídas? Esta ação não pode ser desfeita."
                confirmLabel="Excluir concluídas"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default ClearCompletedTasks;
