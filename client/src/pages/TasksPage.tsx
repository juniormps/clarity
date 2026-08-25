import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ClearCompletedTasks from "../components/ClearCompletedTasks/ClearCompletedTasks";
import TaskComposer from "../components/TaskComposer/TaskComposer";
import TaskFilters from "../components/TaskFilters/TaskFilters";
import TaskList from "../components/TaskList/TaskList";
import TaskListState, {
    type TaskListStateVariant,
} from "../components/TaskListState/TaskListState";
import TaskSearch from "../components/TaskSearch/TaskSearch";
import TaskSummary from "../components/TaskSummary/TaskSummary";
import TasksHero from "../components/TasksHero/TasksHero";
import type { AppLayoutOutletContext } from "../layouts/AppLayout/AppLayoutContext";
import type { TaskFilter } from "../types/taskFilter";
import styles from "./TasksPage.module.css";

function TasksPage() {
    const { taskState, stats } = useOutletContext<AppLayoutOutletContext>();

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
    } = taskState;

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

    const emptyStateVariant: TaskListStateVariant =
        normalizedSearch.length > 0
            ? "search"
            : filter === "pending"
                ? "pending"
                : "completed";

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

    const totalLabel = `${stats.total} ${
        stats.total === 1 ? "tarefa" : "tarefas"
    } no total`;

    return (
        <main id="conteudo-principal" className={styles.container}>
            <TasksHero stats={stats} />

            <TaskComposer
                createTask={createTask}
                isCreating={isCreating}
                createError={createError}
                clearCreateError={clearCreateError}
            />

            <section className={styles.workspace} aria-labelledby="tasks-title">
                <div className={styles.workspaceHeading}>
                    <div className={styles.headingCopy}>
                        <p className={styles.eyebrow}>Visão geral</p>
                        <h2 id="tasks-title" className={styles.title}>
                            Minhas tarefas
                        </h2>
                    </div>

                    <TaskSummary tasks={tasks} />
                </div>

                <div className={styles.toolbar}>
                    <TaskFilters activeFilter={filter} onFilterChange={setFilter} />
                    
                    <TaskSearch value={searchTerm} onChange={setSearchTerm} />
                </div>

                <div className={styles.taskArea}>
                    {isLoadingTasks ? (
                        <TaskListState variant="loading" />
                    ) : error ? (
                        <TaskListState variant="error" message={error} />
                    ) : tasks.length === 0 ? (
                        <TaskListState variant="empty" />
                    ) : visibleTasks.length === 0 ? (
                        <TaskListState variant={emptyStateVariant} />
                    ) : (
                        <TaskList
                            tasks={visibleTasks}
                            updatingCompletedTaskIds={updatingCompletedTaskIds}
                            deletingTaskIds={deletingTaskIds}
                            editingTaskIds={editingTaskIds}
                            updateCompletedErrors={updateCompletedErrors}
                            deleteErrors={deleteErrors}
                            openEditTaskId={openEditTaskId}
                            editError={editError}
                            onToggleCompleted={updateTaskCompleted}
                            onDelete={deleteTask}
                            onUpdateTitle={updateTaskTitle}
                            onClearEditError={clearEditError}
                            onStartEdit={(id) => setOpenEditTaskId(id)}
                            onCancelEdit={() => setOpenEditTaskId(null)}
                        />
                    )}
                </div>

                <div className={styles.workspaceFooter}>
                    <p className={styles.total}>{totalLabel}</p>

                    <ClearCompletedTasks
                        hasCompletedTasks={hasCompletedTasks}
                        isDeleting={isDeletingCompleted}
                        error={deleteCompletedError}
                        onDeleteCompleted={handleClearCompleted}
                    />
                </div>
            </section>
        </main>
    );
}

export default TasksPage;
