import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { logoutUser } from "../../services/authService";
import { setUnauthenticated } from "./authSlice";
import styles from "./LogoutButton.module.css";

function LogoutButton() {

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setError(null);
        setIsLoggingOut(true);

        try {
            await logoutUser();

            dispatch(setUnauthenticated());
            navigate("/", { replace: true });

        } catch (logoutError) {
            setError(
                logoutError instanceof Error
                    ? logoutError.message
                    : "Não foi possível sair.",
            );
            
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.button}
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? "Saindo..." : "Sair"}
            </button>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default LogoutButton;
