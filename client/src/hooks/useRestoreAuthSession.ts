import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    selectAuthStatus,
    setAuthenticatedUser,
    setUnauthenticated,
    startAuthCheck,
} from "../features/auth/authSlice";
import { getCurrentUser } from "../services/authService";

//Restaura a sessão autenticada quando o estado global de autenticação ainda está "idle".
export function useRestoreAuthSession() {
    
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);

    useEffect(() => {
        if (status !== "idle") {
            return;
        }

        dispatch(startAuthCheck());

        getCurrentUser()
            .then((user) => {
                if (user) {
                    dispatch(setAuthenticatedUser(user));
                } else {
                    dispatch(setUnauthenticated());
                }
            })
            .catch(() => {
                dispatch(setUnauthenticated());
            });
    }, [dispatch, status]);
}
