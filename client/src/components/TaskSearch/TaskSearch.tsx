import styles from "./TaskSearch.module.css";

interface TaskSearchProps {
    value: string;
    onChange: (value: string) => void;
}

function TaskSearch({ value, onChange }: TaskSearchProps) {
    return (
        <div className={styles.search}>
            <label className={styles.label} htmlFor="task-search">
                Buscar tarefas
            </label>

            <div className={styles.field}>
                <svg className={styles.icon} aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                    id="task-search"
                    className={styles.input}
                    type="search"
                    value={value}
                    placeholder="Buscar tarefa..."
                    onChange={(event) => onChange(event.target.value)}
                />

                {value.length > 0 && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        aria-label="Limpar busca"
                        onClick={() => onChange("")}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskSearch;
