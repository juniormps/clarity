import { describe, expect, it } from "vitest";
import type { User } from "../../types/user";
import authReducer, {
    selectAuthStatus,
    selectAuthUser,
    selectIsAuthenticated,
    setAuthenticatedUser,
    setUnauthenticated,
    startAuthCheck,
} from "./authSlice";
import type { AuthState } from "./authSlice";

const mockUser: User = {
    id: 1,
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

const authenticatedState: AuthState = {
    user: mockUser,
    status: "authenticated",
};

describe("authSlice", () => {
    it("deve iniciar com usuário nulo e status idle", () => {
        const state = authReducer(undefined, { type: "unknown" });

        expect(state).toEqual({
            user: null,
            status: "idle",
        });
    });

    it("startAuthCheck deve levar para user null e status checking", () => {
        const state = authReducer(authenticatedState, startAuthCheck());

        expect(state).toEqual({
            user: null,
            status: "checking",
        });
    });

    it("setAuthenticatedUser deve definir o usuário e o status authenticated", () => {
        const state = authReducer(undefined, setAuthenticatedUser(mockUser));

        expect(state).toEqual({
            user: mockUser,
            status: "authenticated",
        });
    });

    it("setUnauthenticated deve limpar o usuário e definir status unauthenticated", () => {
        const state = authReducer(authenticatedState, setUnauthenticated());

        expect(state).toEqual({
            user: null,
            status: "unauthenticated",
        });
    });
});

describe("auth selectors", () => {
    const idleState: AuthState = { user: null, status: "idle" };
    const checkingState: AuthState = { user: null, status: "checking" };
    const unauthenticatedState: AuthState = {
        user: null,
        status: "unauthenticated",
    };

    it("selectAuthUser deve retornar o usuário", () => {
        expect(selectAuthUser({ auth: authenticatedState })).toBe(mockUser);
        expect(selectAuthUser({ auth: idleState })).toBeNull();
    });

    it("selectAuthStatus deve retornar o status", () => {
        expect(selectAuthStatus({ auth: authenticatedState })).toBe(
            "authenticated"
        );
        expect(selectAuthStatus({ auth: idleState })).toBe("idle");
    });

    it("selectIsAuthenticated deve ser true apenas quando authenticated", () => {
        expect(selectIsAuthenticated({ auth: authenticatedState })).toBe(true);
        expect(selectIsAuthenticated({ auth: idleState })).toBe(false);
        expect(selectIsAuthenticated({ auth: checkingState })).toBe(false);
        expect(selectIsAuthenticated({ auth: unauthenticatedState })).toBe(
            false
        );
    });
});
