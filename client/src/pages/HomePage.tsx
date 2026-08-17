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
        updatingCompletedTaskId,
        updateCompletedError,
        updateTaskCompleted,
        deletingTaskId,
        deleteError,
        deleteTask,
        editingTaskId,
        editError,
        editErrorTaskId,
        updateTaskTitle,
        clearEditError,
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
                            isUpdating={updatingCompletedTaskId === task.id}
                            isDeleting={deletingTaskId === task.id}
                            isEditingTitle={editingTaskId === task.id}
                            editError={editErrorTaskId === task.id ? editError : null}
                            onToggleCompleted={updateTaskCompleted}
                            onDelete={deleteTask}
                            onUpdateTitle={updateTaskTitle}
                            onClearEditError={clearEditError}
                        />
                    ))}
                </ul>
            )}

            {updateCompletedError && (
                <p className={styles.error} role="alert">
                    {updateCompletedError}
                </p>
            )}

            {deleteError && (
                <p className={styles.error} role="alert">
                    {deleteError}
                </p>
            )}
        </main>
    );
}
