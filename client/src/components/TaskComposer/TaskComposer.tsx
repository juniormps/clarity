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

export function TaskComposer({
    createTask,
    isCreating,
    createError,
    clearCreateError,
}: TaskComposerProps) {
    const [title, setTitle] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmed = title.trim();

        if (trimmed.length === 0) {
            setValidationError("O título não pode ficar vazio.");
            return;
        }

        setValidationError(null);

        try {
            await createTask(trimmed);
            setTitle("");
        } catch {
            // A criação falhou: mantém o texto e exibe o erro via createError.
        }
    }

    const errorMessage = validationError ?? createError;

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
                    onChange={(event) => {
                        setTitle(event.target.value);
                        if (validationError) {
                            setValidationError(null);
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
