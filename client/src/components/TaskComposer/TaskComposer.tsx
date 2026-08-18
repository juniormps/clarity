import type { FormEvent } from "react";
import { useState } from "react";
import type { Task } from "../../types/task";
import styles from "./TaskComposer.module.css";

interface TaskComposerProps {
    createTask: (title: string) => Promise<Task>;
    isCreating: boolean;
    createError: string | null;
    clearCreateError: () => void;
}

function TaskComposer({
    createTask,
    isCreating,
    createError,
    clearCreateError,
}: TaskComposerProps) {
    const [title, setTitle] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmed = title.trim();

        if (trimmed.length === 0) {
            setValidationError("O título não pode ficar vazio.");
            return;
        }

        setValidationError(null);
        setLimitMessage(null);

        try {
            await createTask(trimmed);
            setTitle("");
        } catch {
            // A criação falhou: mantém o texto e exibe o erro via createError.
        }
    }

    const errorMessage = validationError ?? limitMessage ?? createError;

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label} htmlFor="task-title">
                Nova tarefa
            </label>
            <div className={styles.row}>
                <input
                    id="task-title"
                    className={styles.input}
                    type="text"
                    value={title}
                    maxLength={140}
                    placeholder="O que precisa ser feito?"
                    aria-invalid={errorMessage ? true : undefined}
                    aria-describedby={
                        errorMessage ? "task-composer-error" : undefined
                    }
                    onBeforeInput={() => {
                        if (title.length >= 140) {
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
                            title.length - (end - start) + pasted.length;
                        if (resultLength > 140) {
                            setLimitMessage(
                                "O título deve ter no máximo 140 caracteres.",
                            );
                        }
                    }}
                    onChange={(event) => {
                        const value = event.target.value;
                        setTitle(value);
                        if (validationError) {
                            setValidationError(null);
                        }
                        if (limitMessage && value.length < 140) {
                            setLimitMessage(null);
                        }
                        if (createError) {
                            clearCreateError();
                        }
                    }}
                />
                <button
                    type="submit"
                    className={styles.button}
                    disabled={isCreating}
                >
                    {isCreating ? "Criando..." : "Criar"}
                </button>
            </div>
            {errorMessage && (
                <p
                    id="task-composer-error"
                    className={styles.error}
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}
        </form>
    );
}

export default TaskComposer;
