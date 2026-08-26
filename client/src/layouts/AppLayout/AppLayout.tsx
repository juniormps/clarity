import { useCallback } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import AppHeader from "../../components/AppHeader/AppHeader";
import SkipLink from "../../components/SkipLink/SkipLink";
import { setUnauthenticated } from "../../features/auth/authSlice";
import { useTasks } from "../../hooks/useTasks";
import { getTaskStats } from "../../utils/getTaskStats";
import type { AppLayoutOutletContext } from "./AppLayoutContext";
import styles from "./AppLayout.module.css";

function AppLayout() {
    const dispatch = useAppDispatch();

    //Quando uma API protegida retorna 401 durante o uso, o estado global de
    //autenticação é invalidado e o ProtectedRoute redireciona para /login.
    const handleUnauthorized = useCallback(() => {
        dispatch(setUnauthenticated());
    }, [dispatch]);

    const taskState = useTasks(handleUnauthorized);
    const stats = getTaskStats(taskState.tasks);

    const context: AppLayoutOutletContext = { taskState, stats };

    return (
        <div className={styles.shell}>
            <SkipLink />

            <AppHeader pending={stats.pending} isLoading={taskState.isLoadingTasks} />

            <div className={styles.content}>
                <Outlet context={context} />
            </div>
        </div>
    );
}

export default AppLayout;
