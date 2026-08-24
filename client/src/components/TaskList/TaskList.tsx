import type { Task } from "../../types/task";
import TaskItem from "../TaskItem/TaskItem";
import styles from "./TaskList.module.css";

interface TaskListProps {
    tasks: readonly Task[];
    updatingCompletedTaskIds: ReadonlySet<number>;
    deletingTaskIds: ReadonlySet<number>;
    editingTaskIds: ReadonlySet<number>;
    updateCompletedErrors: Readonly<Record<number, string>>;
    deleteErrors: Readonly<Record<number, string>>;
    openEditTaskId: number | null;
    editError: string | null;
    onToggleCompleted: (id: number, completed: boolean) => Promise<Task>;
    onDelete: (id: number) => Promise<void>;
    onUpdateTitle: (id: number, title: string) => Promise<Task>;
    onClearEditError: () => void;
    onStartEdit: (id: number) => void;
    onCancelEdit: () => void;
}

function TaskList({
    tasks,
    updatingCompletedTaskIds,
    deletingTaskIds,
    editingTaskIds,
    updateCompletedErrors,
    deleteErrors,
    openEditTaskId,
    editError,
    onToggleCompleted,
    onDelete,
    onUpdateTitle,
    onClearEditError,
    onStartEdit,
    onCancelEdit,
}: TaskListProps) {
    
    return (
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
                    onStartEdit={() => onStartEdit(task.id)}
                    onCancelEdit={onCancelEdit}
                    onToggleCompleted={onToggleCompleted}
                    onDelete={onDelete}
                    onUpdateTitle={onUpdateTitle}
                    onClearEditError={onClearEditError}
                />
            ))}
        </ul>
    );
}

export default TaskList;
