import { Outlet } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import { useTasks } from "../../hooks/useTasks";
import { getTaskStats } from "../../utils/getTaskStats";
import type { AppLayoutOutletContext } from "./AppLayoutContext";
import styles from "./AppLayout.module.css";

function AppLayout() {
    const taskState = useTasks();
    const stats = getTaskStats(taskState.tasks);

    const context: AppLayoutOutletContext = { taskState, stats };

    return (
        <div className={styles.shell}>
            <a className={styles.skipLink} href="#conteudo-principal">
                Ir para o conteúdo
            </a>

            <AppHeader pending={stats.pending} isLoading={taskState.isLoadingTasks} />

            <div className={styles.content}>
                <Outlet context={context} />
            </div>
        </div>
    );
}

export default AppLayout;
