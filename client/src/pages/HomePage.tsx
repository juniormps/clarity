import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

function HomePage() {
    return (
        <main className={styles.main}>
            <p className={styles.brand}>Clarity</p>

            <h1 className={styles.title}>
                Organize e acompanhe suas tarefas com clareza
            </h1>

            <p className={styles.description}>
                O Clarity ajuda você a organizar suas tarefas e a acompanhar o que
                precisa ser feito.
            </p>

            <div className={styles.actions}>
                <Link className={styles.primary} to="/register">
                    Criar conta
                </Link>
                <Link className={styles.secondary} to="/login">
                    Entrar
                </Link>
            </div>
        </main>
    );
}

export default HomePage;
