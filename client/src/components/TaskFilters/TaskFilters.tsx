import type { TaskFilter } from "../../types/taskFilter";
import styles from "./TaskFilters.module.css";

interface TaskFiltersProps {
    activeFilter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

const FILTER_OPTIONS: readonly { value: TaskFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendentes" },
    { value: "completed", label: "Concluídas" },
];

function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
    
    return (
        <div className={styles.filters}>
            {FILTER_OPTIONS.map((option) => {
                const isActive = activeFilter === option.value;
                const buttonClass = isActive ? `${styles.button} ${styles.active}` : styles.button;

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={buttonClass}
                        aria-pressed={isActive}
                        onClick={() => onFilterChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export default TaskFilters;
