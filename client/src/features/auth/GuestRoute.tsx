import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectAuthStatus } from "./authSlice";

function GuestRoute() {

    const status = useAppSelector(selectAuthStatus);

    if (status === "idle" || status === "checking") {
        return <p role="status">Verificando sessão...</p>;
    }

    if (status === "authenticated") {
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
}

export default GuestRoute;
