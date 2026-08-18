import { useState } from "react";
import TaskComposer from "../components/TaskComposer/TaskComposer";
import TaskFilters from "../components/TaskFilters/TaskFilters";
import TaskItem from "../components/TaskItem/TaskItem";
import { useTasks } from "../hooks/useTasks";
import type { TaskFilter } from "../types/taskFilter";
import styles from "./HomePage.module.css";

function HomePage() {

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

    // Filtro de visualização das tarefas (estado local de interface).
    const [filter, setFilter] = useState<TaskFilter>("all");

    const visibleTasks = tasks.filter((task) => {
        if (filter === "pending") {
            return !task.completed;
        }
        if (filter === "completed") {
            return task.completed;
        }
        return true;
    });

    const emptyFilterMessage =
        filter === "pending"
            ? "Nenhuma tarefa pendente."
            : "Nenhuma tarefa concluída.";

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

            <TaskFilters activeFilter={filter} onFilterChange={setFilter} />

            {isLoadingTasks && <p className={styles.status}>Carregando tarefas...</p>}

            {!isLoadingTasks && error && <p className={styles.error}>{error}</p>}

            {!isLoadingTasks && !error && tasks.length === 0 && (
                <p className={styles.status}>Nenhuma tarefa cadastrada.</p>
            )}

            {!isLoadingTasks && !error && tasks.length > 0 && visibleTasks.length === 0 && (
                <p className={styles.status}>{emptyFilterMessage}</p>
            )}

            {!isLoadingTasks && !error && visibleTasks.length > 0 && (
                <ul className={styles.list}>
                    {visibleTasks.map((task) => (
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

export default HomePage;
