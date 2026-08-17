import { useState } from "react";
import { TaskComposer } from "../components/TaskComposer/TaskComposer";
import { TaskItem } from "../components/TaskItem/TaskItem";
import { useTasks } from "../hooks/useTasks";
import styles from "./HomePage.module.css";

export function HomePage() {

    const {
        tasks,
        isLoadingTasks,
        error,
        isCreating,
        createError,
        createTask,
        clearCreateError,
        updatingCompletedTaskIds,
        updateCompletedErrors,
        updateTaskCompleted,
        deletingTaskIds,
        deleteErrors,
        deleteTask,
        editingTaskIds,
        editError,
        updateTaskTitle,
        clearEditError,
    } = useTasks();

    // Estado utilizado para controlar qual tarefa está sendo editada no momento.
    const [openEditTaskId, setOpenEditTaskId] = useState<number | null>(null);

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

            {isLoadingTasks && <p className={styles.status}>Carregando tarefas...</p>}

            {!isLoadingTasks && error && <p className={styles.error}>{error}</p>}

            {!isLoadingTasks && !error && tasks.length === 0 && (
                <p className={styles.status}>Nenhuma tarefa cadastrada.</p>
            )}

            {!isLoadingTasks && !error && tasks.length > 0 && (
                <ul className={styles.list}>
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isUpdating={updatingCompletedTaskIds.has(task.id)}
                            isDeleting={deletingTaskIds.has(task.id)}
                            isEditingTitle={editingTaskIds.has(task.id)}
                            updateError={updateCompletedErrors[task.id] ?? null}
                            deleteError={deleteErrors[task.id] ?? null}
                            editError={openEditTaskId === task.id ? editError : null}
                            isEditing={openEditTaskId === task.id}
                            onStartEdit={() => setOpenEditTaskId(task.id)}
                            onCancelEdit={() => setOpenEditTaskId(null)}
                            onToggleCompleted={updateTaskCompleted}
                            onDelete={deleteTask}
                            onUpdateTitle={updateTaskTitle}
                            onClearEditError={clearEditError}
                        />
                    ))}
                </ul>
            )}
        </main>
    );
}
