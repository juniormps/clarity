import { TaskComposer } from "../components/TaskComposer/TaskComposer";
import { TaskItem } from "../components/TaskItem/TaskItem";
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
        updatingTaskId,
        updateError,
        updateTaskCompleted,
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

            {isLoading && <p className={styles.status}>Carregando tarefas...</p>}

            {!isLoading && error && <p className={styles.error}>{error}</p>}

            {!isLoading && !error && tasks.length === 0 && (
                <p className={styles.status}>Nenhuma tarefa cadastrada.</p>
            )}

            {!isLoading && !error && tasks.length > 0 && (
                <ul className={styles.list}>
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isUpdating={updatingTaskId === task.id}
                            onToggleCompleted={updateTaskCompleted}
                        />
                    ))}
                </ul>
            )}

            {updateError && (
                <p className={styles.error} role="alert">
                    {updateError}
                </p>
            )}
        </main>
    );
}
