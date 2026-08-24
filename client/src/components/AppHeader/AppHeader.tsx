import { Link } from "react-router-dom";
import LogoutButton from "../../features/auth/LogoutButton";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
    pending: number;
    isLoading: boolean;
}

function AppHeader({ pending, isLoading }: AppHeaderProps) {
    let statusText: string;

    if (isLoading) {
        statusText = "Carregando tarefas...";
    } else if (pending === 0) {
        statusText = "Tudo em dia";
    } else if (pending === 1) {
        statusText = "1 tarefa pendente";
    } else {
        statusText = `${pending} tarefas pendentes`;
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link className={styles.brand} to="/app">
                    <span className={styles.brandMark} aria-hidden="true">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M5.5 10.5 8.5 13.5 14.5 7"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    <span className={styles.brandName}>clarity</span>
                </Link>

                <div className={styles.actions}>
                    <p className={styles.status} aria-live="polite">
                        <span className={styles.statusDot} aria-hidden="true" />
                        {statusText}
                    </p>

                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
