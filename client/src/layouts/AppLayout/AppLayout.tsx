import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

function AppLayout() {
    return (
        <div className={styles.shell}>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;
