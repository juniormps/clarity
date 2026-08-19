import { useState } from "react";
import ClearCompletedTasks from "../components/ClearCompletedTasks/ClearCompletedTasks";
import TaskComposer from "../components/TaskComposer/TaskComposer";
import TaskFilters from "../components/TaskFilters/TaskFilters";
import TaskItem from "../components/TaskItem/TaskItem";
import TaskSearch from "../components/TaskSearch/TaskSearch";
import TaskSummary from "../components/TaskSummary/TaskSummary";
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
        isDeletingCompleted,
        deleteCompletedError,
        deleteCompletedTasks,
        editingTaskIds,
        editError,
        updateTaskTitle,
        clearEditError,
    } = useTasks();

    // Estado utilizado para controlar qual tarefa está sendo editada no momento.
    const [openEditTaskId, setOpenEditTaskId] = useState<number | null>(null);

    // Filtro de visualização das tarefas (estado local de interface).
    const [filter, setFilter] = useState<TaskFilter>("all");

    // Termo de busca por título (estado local de interface).
    const [searchTerm, setSearchTerm] = useState("");

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const hasCompletedTasks = tasks.some((task) => task.completed);

    const visibleTasks = tasks.filter((task) => {
        const matchesFilter =
            filter === "pending"
                ? !task.completed
                : filter === "completed"
                    ? task.completed
                    : true;

        const matchesSearch =
            normalizedSearch.length === 0 ||
            task.title.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
    });

    const emptyMessage =
        normalizedSearch.length > 0
            ? "Nenhuma tarefa encontrada."
            : filter === "pending"
                ? "Nenhuma tarefa pendente."
                : "Nenhuma tarefa concluída.";

    //Exclusão em massa de todas as tarefas concluídas. 
    //Se houver uma tarefa entre as concluídas, aberta em edição, o modo de edição é encerrado.            
    async function handleClearCompleted() {
        const editingCompletedTask =
            openEditTaskId !== null &&
            tasks.some((task) => task.id === openEditTaskId && task.completed);

        await deleteCompletedTasks();

        if (editingCompletedTask) {
            setOpenEditTaskId(null);
        }
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Clarity</h1>
            <p className={styles.subtitle}>Task management made clear</p>

            <TaskSummary tasks={tasks} />

            <TaskComposer
                createTask={createTask}
                isCreating={isCreating}
                createError={createError}
                clearCreateError={clearCreateError}
            />

            <TaskSearch value={searchTerm} onChange={setSearchTerm} />

            <TaskFilters activeFilter={filter} onFilterChange={setFilter} />

            <ClearCompletedTasks
                hasCompletedTasks={hasCompletedTasks}
                isDeleting={isDeletingCompleted}
                error={deleteCompletedError}
                onDeleteCompleted={handleClearCompleted}
            />

            {isLoadingTasks && <p className={styles.status}>Carregando tarefas...</p>}

            {!isLoadingTasks && error && <p className={styles.error}>{error}</p>}

            {!isLoadingTasks && !error && tasks.length === 0 && (
                <p className={styles.status}>Nenhuma tarefa cadastrada.</p>
            )}

            {!isLoadingTasks && !error && tasks.length > 0 && visibleTasks.length === 0 && (
                <p className={styles.status}>{emptyMessage}</p>
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
