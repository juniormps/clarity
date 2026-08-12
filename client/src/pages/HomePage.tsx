import { TaskComposer } from "../components/TaskComposer/TaskComposer";
import { useTasks } from "../hooks/useTasks";
import styles from "./HomePage.module.css";

export function HomePage() {
    const {
        tasks,
        isLoading,
        error,
        isCreating,
        createError,
        createTask,
        clearCreateError,
    } = useTasks();

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Clarity</h1>
            <p className={styles.subtitle}>Task management made clear</p>

            <TaskComposer
                createTask={createTask}
                isCreating={isCreating}
                createError={createError}
                clearCreateError={clearCreateError}
            />

            {isLoading && (
                <p className={styles.status}>Carregando tarefas...</p>
            )}

            {!isLoading && error && <p className={styles.error}>{error}</p>}

            {!isLoading && !error && tasks.length === 0 && (
                <p className={styles.status}>Nenhuma tarefa cadastrada.</p>
            )}

            {!isLoading && !error && tasks.length > 0 && (
                <ul className={styles.list}>
                    {tasks.map((task) => (
                        <li key={task.id} className={styles.item}>
                            <span className={styles.itemTitle}>
                                {task.title}
                            </span>
                            <span className={styles.itemStatus}>
                                {task.completed ? "Concluída" : "Pendente"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
