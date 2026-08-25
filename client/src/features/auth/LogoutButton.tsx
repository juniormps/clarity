import { useState } from "react";
import { flushSync } from "react-dom";
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

            // Navega para a Home enquanto o usuário ainda está autenticado e
            // garante que essa navegação seja confirmada antes de alterar o
            // estado global. Dessa forma o ProtectedRoute é desmontado e não
            // dispara o redirect para /login, que competia com o destino
            // explícito do logout (a Home pública).
            flushSync(() => {
                navigate("/", { replace: true });
            });

            dispatch(setUnauthenticated());

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
