import { Route, Routes } from "react-router-dom";
import GuestRoute from "./features/auth/GuestRoute";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import { useRestoreAuthSession } from "./hooks/useRestoreAuthSession";
import AppLayout from "./layouts/AppLayout/AppLayout";
import PublicLayout from "./layouts/PublicLayout/PublicLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

function App() {
    useRestoreAuthSession();

    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />

                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/app" element={<TasksPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
