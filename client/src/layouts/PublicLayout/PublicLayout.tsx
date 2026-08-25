import { Link, Outlet } from "react-router-dom";
import SkipLink from "../../components/SkipLink/SkipLink";
import styles from "./PublicLayout.module.css";

function PublicLayout() {
    return (
        <div className={styles.shell}>
            <SkipLink />

            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <Link className={styles.brand} to="/">
                        Clarity
                    </Link>

                    <nav className={styles.nav} aria-label="Navegação principal">
                        <Link className={styles.navLink} to="/login">
                            Entrar
                        </Link>
                        <Link
                            className={`${styles.navLink} ${styles.navLinkPrimary}`}
                            to="/register"
                        >
                            Criar conta
                        </Link>
                    </nav>
                </div>
            </header>

            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

export default PublicLayout;
