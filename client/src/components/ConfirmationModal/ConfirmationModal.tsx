import { useEffect, useId, useRef } from "react";
import styles from "./ConfirmationModal.module.css";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

    // IDs únicos para associar título e descrição ao diálogo (acessibilidade).
    const titleId = useId();
    const descriptionId = useId();

    // Sincroniza a abertura/fechamento do <dialog> com a prop isOpen.
    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (isOpen && !dialog.open) {
            dialog.showModal();
            // Para ação destrutiva, o foco inicial vai para Cancelar.
            cancelButtonRef.current?.focus();
            
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }

    }, [isOpen]);

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={onCancel}
        >
            <div className={styles.card}>
                <h2 id={titleId} className={styles.title}>
                    {title}
                </h2>

                <p id={descriptionId} className={styles.message}>
                    {message}
                </p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        ref={cancelButtonRef}
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmationModal;
