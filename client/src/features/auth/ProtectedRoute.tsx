import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectAuthStatus } from "./authSlice";

function ProtectedRoute() {
    
    const status = useAppSelector(selectAuthStatus);

    if (status === "idle" || status === "checking") {
        return <p role="status">Verificando sessão...</p>;
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
