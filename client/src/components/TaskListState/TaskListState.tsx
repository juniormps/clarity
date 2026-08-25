import styles from "./TaskListState.module.css";

export type TaskListStateVariant =
    | "empty"
    | "search"
    | "pending"
    | "completed"
    | "error"
    | "loading";

interface TaskListStateProps {
    variant: TaskListStateVariant;
    message?: string;
}

interface StateContent {
    title: string;
    description: string;
}

const STATE_CONTENT: Record<
    Exclude<TaskListStateVariant, "error" | "loading">,
    StateContent
> = {
    empty: {
        title: "Sua lista está pronta",
        description:
            "Adicione sua primeira tarefa e comece com um pequeno passo.",
    },
    search: {
        title: "Nenhuma tarefa encontrada",
        description: "Tente ajustar a busca ou selecionar outro filtro.",
    },
    pending: {
        title: "Nenhuma pendência por aqui",
        description: "Tente ajustar a busca ou selecionar outro filtro.",
    },
    completed: {
        title: "Ainda não há tarefas concluídas",
        description: "Tente ajustar a busca ou selecionar outro filtro.",
    },
};

const LOADING_ROWS = 3;

function TaskListState({ variant, message }: TaskListStateProps) {
    
    if (variant === "loading") {
        return (
            <div className={styles.loading} role="status">
                <span className={styles.visuallyHidden}>
                    Carregando tarefas...
                </span>

                <div className={styles.skeleton} aria-hidden="true">
                    {Array.from({ length: LOADING_ROWS }, (_, index) => (
                        <div key={index} className={styles.skeletonItem}>
                            <div className={styles.skeletonCheckbox} />

                            <div className={styles.skeletonCopy}>
                                <div className={styles.skeletonLineStrong} />
                                <div className={styles.skeletonLineShort} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "error") {
        return (
            <div className={styles.state} role="alert">
                <div className={styles.iconError} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </div>

                <h3 className={styles.title}>{message}</h3>

                <p className={styles.description}>
                    Verifique sua conexão e atualize a página para tentar
                    novamente.
                </p>
            </div>
        );
    }

    const content = STATE_CONTENT[variant];

    return (
        <div className={styles.state} role="status">
            <div className={styles.icon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="M8 6h11M8 12h11M8 18h7" />
                    <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
                </svg>
            </div>

            <h3 className={styles.title}>{content.title}</h3>

            <p className={styles.description}>{content.description}</p>
        </div>
    );
}

export default TaskListState;
