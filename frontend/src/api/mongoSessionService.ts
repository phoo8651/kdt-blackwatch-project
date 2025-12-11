import { apiClient } from './client';
import {
    MongoSessionInfoDto,
    ContributorSessionDto,
    MessageResponseDto,
    MongoSessionCreateOptions,
    MongoSessionExtendOptions
} from '../types';

export const mongoSessionService = {
    // MongoDB 세션 생성
    createSession: (options?: MongoSessionCreateOptions) =>
        apiClient.post<MongoSessionInfoDto>('/contrib/mongo-sessions', options),

    // 내 MongoDB 세션 목록 조회
    getMySessions: () =>
        apiClient.get<ContributorSessionDto[]>('/contrib/mongo-sessions'),

    // 특정 MongoDB 세션 연장
    extendSession: (sessionId: string, options: MongoSessionExtendOptions) =>
        apiClient.put<MongoSessionInfoDto>(
            `/contrib/mongo-sessions/${sessionId}/extend?additionalHours=${options.additionalHours}`
        ),

    // 특정 MongoDB 세션 삭제
    deleteSession: (sessionId: string) =>
        apiClient.delete<MessageResponseDto>(`/contrib/mongo-sessions/${sessionId}`),

    // 모든 MongoDB 세션 삭제
    deleteAllSessions: () =>
        apiClient.delete<MessageResponseDto>('/contrib/mongo-sessions'),

    // 세션 상태 확인 (헬스체크)
    checkSessionHealth: async (sessionInfo: MongoSessionInfoDto): Promise<boolean> => {
        try {
            // 실제로는 MongoDB 연결을 테스트해야 하지만,
            // 여기서는 세션 만료 시간만 체크
            const now = new Date();
            const expiresAt = new Date(sessionInfo.expiresAt);
            return now < expiresAt;
        } catch {
            return false;
        }
    },

    // 세션 만료까지 남은 시간(분) 계산
    getSessionRemainingMinutes: (sessionInfo: MongoSessionInfoDto): number => {
        const now = new Date();
        const expiresAt = new Date(sessionInfo.expiresAt);
        const diffMs = expiresAt.getTime() - now.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    },

    // 세션이 곧 만료되는지 확인 (기본: 30분)
    isSessionExpiringSoon: (sessionInfo: MongoSessionInfoDto, thresholdMinutes: number = 30): boolean => {
        const remainingMinutes = mongoSessionService.getSessionRemainingMinutes(sessionInfo);
        return remainingMinutes <= thresholdMinutes;
    },
};