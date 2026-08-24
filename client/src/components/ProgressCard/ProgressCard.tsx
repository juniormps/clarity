import type { CSSProperties } from "react";
import styles from "./ProgressCard.module.css";

interface ProgressCardProps {
    total: number;
    completed: number;
    percentage: number;
}

function ProgressCard({ total, completed, percentage }: ProgressCardProps) {
    const countLabel = `${completed} de ${total} ${
        total === 1 ? "tarefa concluída" : "tarefas concluídas"
    }`;

    return (
        <div className={styles.card}>
            <div
                className={styles.ring}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                aria-label="Progresso das tarefas"
                style={{ "--progress": percentage } as CSSProperties}
            >
                <div className={styles.ringInner}>
                    <span className={styles.percentage}>{percentage}%</span>
                </div>
            </div>

            <div className={styles.info}>
                <p className={styles.label}>Seu progresso</p>
                <p className={styles.count}>{countLabel}</p>
            </div>
        </div>
    );
}

export default ProgressCard;
