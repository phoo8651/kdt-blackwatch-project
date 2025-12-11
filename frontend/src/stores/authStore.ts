import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfileDto } from '../types';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: UserProfileDto | null;
    role: string | null;
    expiresAt: string | null;

    // Actions
    login: (token: string, expiresAt: string, role: string) => void;
    logout: () => void;
    setUser: (user: UserProfileDto) => void;
    updateUser: (updates: Partial<UserProfileDto>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            token: null,
            user: null,
            role: null,
            expiresAt: null,

            login: (token: string, expiresAt: string, role: string) => {
                set({
                    isAuthenticated: true,
                    token,
                    expiresAt,
                    role,
                });
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    token: null,
                    user: null,
                    role: null,
                    expiresAt: null,
                });
            },

            setUser: (user: UserProfileDto) => {
                set({ user });
            },

            updateUser: (updates: Partial<UserProfileDto>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, ...updates }
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                user: state.user,
                role: state.role,
                expiresAt: state.expiresAt,
            }),
        }
    )
);