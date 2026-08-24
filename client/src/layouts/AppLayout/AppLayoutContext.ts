import { useTasks } from "../../hooks/useTasks";
import type { TaskStats } from "../../utils/getTaskStats";

// Contexto compartilhado pelo AppLayout através do <Outlet context />.
export interface AppLayoutOutletContext {
    taskState: ReturnType<typeof useTasks>;
    stats: TaskStats;
}
