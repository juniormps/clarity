import { renderHook, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "../features/auth/authSlice";
import type { AuthState } from "../features/auth/authSlice";
import { getCurrentUser } from "../services/authService";
import type { User } from "../types/user";
import { useRestoreAuthSession } from "./useRestoreAuthSession";

vi.mock("../services/authService", () => ({
    getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const mockUser: User = {
    id: 1,
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderHookWithStore(initialAuth?: AuthState) {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: initialAuth ? { auth: initialAuth } : undefined,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useRestoreAuthSession(), { wrapper });

    return store;
}

beforeEach(() => {
    mockedGetCurrentUser.mockReset();
});

describe("useRestoreAuthSession", () => {
    it("restaura a sessão válida a partir do idle", async () => {
        mockedGetCurrentUser.mockResolvedValue(mockUser);

        const store = renderHookWithStore();

        await waitFor(() => {
            expect(store.getState().auth.status).toBe("authenticated");
        });

        expect(store.getState().auth.user).toEqual(mockUser);
    });

    it("leva a unauthenticated quando não há sessão", async () => {
        mockedGetCurrentUser.mockResolvedValue(null);

        const store = renderHookWithStore();

        await waitFor(() => {
            expect(store.getState().auth.status).toBe("unauthenticated");
        });

        expect(store.getState().auth.user).toBeNull();
    });

    it("leva a unauthenticated em falha inesperada e não permanece em checking", async () => {
        mockedGetCurrentUser.mockRejectedValue(new Error("network error"));

        const store = renderHookWithStore();

        await waitFor(() => {
            expect(store.getState().auth.status).toBe("unauthenticated");
        });

        expect(store.getState().auth.user).toBeNull();
    });

    it("não inicia nova restauração quando o estado já está authenticated", () => {
        renderHookWithStore({ user: mockUser, status: "authenticated" });

        expect(mockedGetCurrentUser).not.toHaveBeenCalled();
    });

    it("não inicia nova restauração quando o estado já está unauthenticated", () => {
        renderHookWithStore({ user: null, status: "unauthenticated" });

        expect(mockedGetCurrentUser).not.toHaveBeenCalled();
    });
});
