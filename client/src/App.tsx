import { Route, Routes } from "react-router-dom";
import GuestRoute from "./features/auth/GuestRoute";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import { useRestoreAuthSession } from "./hooks/useRestoreAuthSession";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

function App() {
    useRestoreAuthSession();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<TasksPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
