import type { Task } from "../../types/task";
import styles from "./TaskSummary.module.css";

interface TaskSummaryProps {
    tasks: readonly Task[];
}

function TaskSummary({ tasks }: TaskSummaryProps) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const progressValue = total === 0 ? 0 : completed;
    const progressMax = total === 0 ? 1 : total;

    return (
        <section className={styles.summary} aria-label="Resumo das tarefas">
            <h2 className={styles.heading}>Resumo</h2>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{total}</span>
                    <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{pending}</span>
                    <span className={styles.statLabel}>Pendentes</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{completed}</span>
                    <span className={styles.statLabel}>Concluídas</span>
                </div>
            </div>

            <div className={styles.progressRow}>
                <progress className={styles.progress} value={progressValue} max={progressMax} />
                <p className={styles.progressText}>
                    {completed} de {total} tarefas concluídas — {percentage}%
                </p>
            </div>
        </section>
    );
}

export default TaskSummary;
