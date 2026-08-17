import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types/task";
import styles from "./TaskItem.module.css";

interface TaskItemProps {
    task: Task;
    isUpdating: boolean;
    isDeleting: boolean;
    isEditingTitle: boolean;
    isEditing: boolean;
    editError: string | null;
    onToggleCompleted: (id: number, completed: boolean) => Promise<Task>;
    onDelete: (id: number) => Promise<void>;
    onUpdateTitle: (id: number, title: string) => Promise<Task>;
    onClearEditError: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
}

export function TaskItem({
    task,
    isUpdating,
    isDeleting,
    isEditingTitle,
    isEditing,
    editError,
    onToggleCompleted,
    onDelete,
    onUpdateTitle,
    onClearEditError,
    onStartEdit,
    onCancelEdit,
}: TaskItemProps) {
    
    const [draftTitle, setDraftTitle] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);

    // Referência para o elemento <li> do item da tarefa.
    const itemRef = useRef<HTMLLIElement | null>(null);

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
        setDraftTitle(task.title);
        setValidationError(null);
        setLimitMessage(null);
        onClearEditError();
        onStartEdit();
    }

    // Função para cancelar a edição do título da tarefa.
    function handleCancel() {
        setDraftTitle(task.title);
        setValidationError(null);
        setLimitMessage(null);
        onClearEditError();
        onCancelEdit();
    }

    //Cancelamento do modo de edição ao clicar fora do item. ----------------//
    const handleCancelRef = useRef(handleCancel);

    useEffect(() => {
        handleCancelRef.current = handleCancel;
    });

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            if (
                itemRef.current &&
                !itemRef.current.contains(event.target as Node)
            ) {
                handleCancelRef.current();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [isEditing]);
    //---------------------------------------------------------------------------//
    

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
            await onUpdateTitle(task.id, trimmed);
            onCancelEdit();
        } catch {
            // Falha: permanece em modo de edição e mantém o texto digitado.
            // A mensagem de erro é exibida via editError.
        }
    }

    // IDs para acessibilidade e mensagens de erro.
    const inputId = `task-title-${task.id}`;
    const errorId = `task-title-error-${task.id}`;
    const errorMessage = validationError ?? limitMessage ?? editError;

    if (isEditing) {
        return (
            <li className={styles.item} ref={itemRef} >
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
                                setLimitMessage(
                                    "O título deve ter no máximo 140 caracteres.",
                                );
                            }
                        }}
                        onPaste={(event) => {
                            const pasted = event.clipboardData.getData("text");
                            const start = event.currentTarget.selectionStart ?? 0;
                            const end = event.currentTarget.selectionEnd ?? start;
                            const resultLength =
                                draftTitle.length - (end - start) + pasted.length;
                            if (resultLength > 140) {
                                setLimitMessage(
                                    "O título deve ter no máximo 140 caracteres.",
                                );
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
                            if (editError) {
                                onClearEditError();
                            }
                        }}
                    />

                    <div className={styles.editActions}>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isEditingTitle}
                        >
                            {isEditingTitle ? "Salvando..." : "Salvar"}
                        </button>

                        <button
                            type="button"
                            className={styles.cancelButton}
                            disabled={isEditingTitle}
                            onClick={handleCancel}
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

    return (
        <li className={styles.item}>
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
        </li>
    );
}
