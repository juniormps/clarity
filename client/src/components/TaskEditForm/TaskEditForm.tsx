import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types/task";
import styles from "./TaskEditForm.module.css";

interface TaskEditFormProps {
    task: Task;
    isSaving: boolean;
    serverError: string | null;
    itemClassName: string;
    onSave: (id: number, title: string) => Promise<Task>;
    onCancel: () => void;
    onClearServerError: () => void;
}

function TaskEditForm({
    task,
    isSaving,
    serverError,
    itemClassName,
    onSave,
    onCancel,
    onClearServerError,
}: TaskEditFormProps) {
    const [draftTitle, setDraftTitle] = useState(task.title);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);

    // Referência para o elemento <li> do item da tarefa.
    const itemRef = useRef<HTMLLIElement | null>(null);

    // Cancela o modo de edição ao clicar fora do item.
    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
                onCancel();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [onCancel]);

    // Função para salvar o título editado da tarefa.
    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmed = draftTitle.trim();

        if (trimmed.length === 0) {
            setValidationError("O título não pode ficar vazio.");
            return;
        }

        if (trimmed.length > 140) {
            setValidationError("O título deve ter no máximo 140 caracteres.");
            return;
        }

        setValidationError(null);
        setLimitMessage(null);

        try {
            await onSave(task.id, trimmed);
            onCancel();
        } catch {
            // Falha: permanece em modo de edição e mantém o texto digitado.
            // A mensagem de erro é exibida via serverError.
        }
    }

    // IDs para acessibilidade e mensagens de erro.
    const inputId = `task-title-${task.id}`;
    const errorId = `task-title-error-${task.id}`;
    const errorMessage = validationError ?? limitMessage ?? serverError;

    return (
        <li className={itemClassName} ref={itemRef}>
            <form className={styles.editForm} onSubmit={handleSave} noValidate>
                <label className={styles.visuallyHidden} htmlFor={inputId}>
                    Editar título da tarefa
                </label>

                <input
                    id={inputId}
                    className={styles.editInput}
                    type="text"
                    value={draftTitle}
                    maxLength={140}
                    autoFocus
                    aria-invalid={errorMessage ? true : undefined}
                    aria-describedby={errorMessage ? errorId : undefined}
                    onBeforeInput={() => {
                        if (draftTitle.length >= 140) {
                            setLimitMessage("O título deve ter no máximo 140 caracteres.");
                        }
                    }}
                    onPaste={(event) => {
                        const pasted = event.clipboardData.getData("text");
                        const start = event.currentTarget.selectionStart ?? 0;
                        const end = event.currentTarget.selectionEnd ?? start;
                        const resultLength = draftTitle.length - (end - start) + pasted.length;
                        if (resultLength > 140) {
                            setLimitMessage("O título deve ter no máximo 140 caracteres.");
                        }
                    }}
                    onChange={(event) => {
                        const value = event.target.value;
                        setDraftTitle(value);
                        if (validationError) {
                            setValidationError(null);
                        }
                        if (limitMessage && value.length < 140) {
                            setLimitMessage(null);
                        }
                        if (serverError) {
                            onClearServerError();
                        }
                    }}
                />

                <div className={styles.editActions}>
                    <button type="submit" className={styles.saveButton} disabled={isSaving}>
                        {isSaving ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                        type="button"
                        className={styles.cancelButton}
                        disabled={isSaving}
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>

                {errorMessage && (
                    <p id={errorId} className={styles.editError} role="alert">
                        {errorMessage}
                    </p>
                )}
            </form>
        </li>
    );
}

export default TaskEditForm;
