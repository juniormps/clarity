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
            
            <div className={styles.row}>
                <input
                    id="task-search"
                    className={styles.input}
                    type="search"
                    value={value}
                    placeholder="Buscar por título"
                    onChange={(event) => onChange(event.target.value)}
                />
                {value.length > 0 && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        aria-label="Limpar busca"
                        onClick={() => onChange("")}
                    >
                        Limpar
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskSearch;
