import { Link } from "react-router-dom";
import LogoutButton from "../../features/auth/LogoutButton";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
    firstName?: string;
}

function AppHeader({ firstName }: AppHeaderProps) {
    const normalizedFirstName = firstName?.trim();
    const greeting = normalizedFirstName ? `Olá, ${normalizedFirstName}!` : "Olá!";

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
                    <p className={styles.greeting}>
                        <span className={styles.presenceDot} aria-hidden="true" />
                        {greeting}
                    </p>

                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
