import type { Task } from "../../types/task";
import { getTaskStats } from "../../utils/getTaskStats";
import styles from "./TaskSummary.module.css";

interface TaskSummaryProps {
    tasks: readonly Task[];
}

function TaskSummary({ tasks }: TaskSummaryProps) {
    
    const { completed, pending } = getTaskStats(tasks);

    const pendingWord = pending === 1 ? "pendente" : "pendentes";
    const completedWord = completed === 1 ? "concluída" : "concluídas";

    return (
        <div className={styles.summary} aria-label="Resumo das tarefas">
            <span className={styles.stat}>
                <strong>{pending}</strong> {pendingWord}
            </span>

            <span className={styles.stat}>
                <strong>{completed}</strong> {completedWord}
            </span>
        </div>
    );
}

export default TaskSummary;
