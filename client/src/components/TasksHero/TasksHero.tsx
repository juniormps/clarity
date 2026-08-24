import ProgressCard from "../ProgressCard/ProgressCard";
import type { TaskStats } from "../../utils/getTaskStats";
import styles from "./TasksHero.module.css";

interface TasksHeroProps {
    stats: TaskStats;
}

function TasksHero({ stats }: TasksHeroProps) {
    return (
        <section className={styles.hero} aria-labelledby="page-title">
            <div className={styles.copy}>
                <p className={styles.eyebrow}>Meu espaço produtivo</p>

                <h1 id="page-title" className={styles.title}>
                    Organize hoje.
                    <span className={styles.titleAccent}>Respire amanhã.</span>
                </h1>

                <p className={styles.description}>
                    Transforme planos em pequenos passos e acompanhe o que realmente
                    importa.
                </p>
            </div>

            <div className={styles.progress}>
                <ProgressCard
                    total={stats.total}
                    completed={stats.completed}
                    percentage={stats.percentage}
                />
            </div>
        </section>
    );
}

export default TasksHero;
