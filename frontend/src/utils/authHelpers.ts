import { useAuthStore } from "@/stores/authStore";
import { UserProfileDto } from "@/types";

/**
 * AuthStore 헬퍼 클래스
 * 컴포넌트 외부에서 auth store에 접근할 때 사용
 */
export class AuthStore {
    /**
     * 현재 토큰을 반환 (만료 체크 포함)
     */
    static getToken(): string | null {
        const state = useAuthStore.getState();

        // 토큰이 없으면 null 반환
        if (!state.token) {
            return null;
        }

        // 만료 체크
        if (state.expiresAt) {
            const now = new Date();
            const expirationDate = new Date(state.expiresAt);

            if (now >= expirationDate) {
                console.warn('Token expired, clearing auth state');
                this.clearAuth();
                return null;
            }
        }

        return state.token;
    }

    /**
     * 인증 상태를 초기화
     */
    static clearAuth(): void {
        useAuthStore.getState().logout();
    }

    /**
     * 사용자가 인증되었는지 확인 (토큰 만료 체크 포함)
     */
    static isAuthenticated(): boolean {
        const state = useAuthStore.getState();

        // 토큰이나 만료 시간이 없으면 false
        if (!state.token || !state.expiresAt) {
            return false;
        }

        // 만료 시간 체크
        const now = new Date();
        const expirationDate = new Date(state.expiresAt);

        if (now >= expirationDate) {
            console.warn('Token expired during auth check');
            this.clearAuth();
            return false;
        }

        return state.isAuthenticated;
    }

    /**
     * 현재 사용자의 역할을 반환
     */
    static getRole(): string | null {
        return useAuthStore.getState().role;
    }

    /**
     * 현재 사용자 정보를 반환
     */
    static getUser(): UserProfileDto | null {
        return useAuthStore.getState().user;
    }

    /**
     * 특정 역할을 가지고 있는지 확인
     */
    static hasRole(role: string): boolean {
        const currentRole = this.getRole();
        return currentRole === role || currentRole === 'ADMIN';
    }

    /**
     * 기여자 권한이 있는지 확인
     */
    static isContributor(): boolean {
        return this.hasRole('CONTRIBUTOR');
    }

    /**
     * 관리자 권한이 있는지 확인
     */
    static isAdmin(): boolean {
        return this.getRole() === 'ADMIN';
    }

    /**
     * 토큰 만료까지 남은 시간(분)을 반환
     */
    static getTokenExpiryMinutes(): number | null {
        const state = useAuthStore.getState();

        if (!state.expiresAt) {
            return null;
        }

        const now = new Date();
        const expirationDate = new Date(state.expiresAt);
        const diffMs = expirationDate.getTime() - now.getTime();

        if (diffMs <= 0) {
            return 0;
        }

        return Math.floor(diffMs / (1000 * 60));
    }

    /**
     * 토큰이 곧 만료되는지 확인 (기본: 5분)
     */
    static isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
        const remainingMinutes = this.getTokenExpiryMinutes();
        return remainingMinutes !== null && remainingMinutes <= thresholdMinutes;
    }

    /**
     * 디버그용 - 현재 auth 상태를 콘솔에 출력
     */
    static debugAuthState(): void {
        if (import.meta.env.DEV) {
            const state = useAuthStore.getState();
            console.log('Auth State:', {
                isAuthenticated: state.isAuthenticated,
                hasToken: !!state.token,
                role: state.role,
                user: state.user?.username,
                expiresAt: state.expiresAt,
                remainingMinutes: this.getTokenExpiryMinutes(),
            });
        }
    }
}