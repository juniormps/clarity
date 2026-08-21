import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { User } from "../../types/user";

export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

export interface AuthState {
    user: User | null;
    status: AuthStatus;
}

const initialState: AuthState = {
    user: null,
    status: "idle",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        startAuthCheck(state) {
            state.user = null;
            state.status = "checking";
        },
        setAuthenticatedUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.status = "authenticated";
        },
        setUnauthenticated(state) {
            state.user = null;
            state.status = "unauthenticated";
        },
    },
});

export const { startAuthCheck, setAuthenticatedUser, setUnauthenticated } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";

export default authSlice.reducer;
