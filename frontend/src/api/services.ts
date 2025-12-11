import { apiClient } from './client';
import {
    // Common types
    MessageResponseDto,
    PaginatedResponse,

    // Auth types
    SignupRequestDto,
    SignupVerifyDto,
    SigninRequestDto,
    SigninResponseDto,
    MfaResponseDto,
    MfaVerifyDto,
    ResetPasswordRequestDto,
    ResetPasswordConfirmDto,

    // User types
    UserProfileDto,
    AccountUpdateDto,

    // Contribution types
    ContributionApplicationDto,
    ContributionApplicationResponseDto,
    ContributionApplicationStatusDto,
    ClientSecretResponseDto,
    ContributorInfoDto,
    ContributorSessionDto,

    // Data types
    LeakedDataDocument,
    VulnerabilityDataDocument,
    PersonalDataSearchDto,
    PersonalDataSearchResultDto,
    MongoLeakedDataDto,
    MongoVulnerabilityDataDto,
    LeakedDataSearchParams,
    VulnerabilityDataSearchParams,
} from '../types';

// Auth Services
export const authService = {
    signupRequest: (data: SignupRequestDto) =>
        apiClient.post<MessageResponseDto>('/auth/signup/request', data),

    signupVerify: (data: SignupVerifyDto) =>
        apiClient.post<MessageResponseDto>('/auth/signup/verify', data),

    signin: (data: SigninRequestDto) =>
        apiClient.post<SigninResponseDto | MfaResponseDto>('/auth/signin', data),

    mfaVerify: (data: MfaVerifyDto) =>
        apiClient.post<SigninResponseDto>('/auth/mfa', data),

    mfaResend: (sessionKey: string) =>
        apiClient.get<MfaResponseDto>(`/auth/mfa/resend?sessionKey=${sessionKey}`),

    enableMfa: () =>
        apiClient.get<MessageResponseDto>('/auth/mfa/enable'),

    disableMfa: () =>
        apiClient.get<MessageResponseDto>('/auth/mfa/disable'),

    resetPasswordRequest: (data: ResetPasswordRequestDto) =>
        apiClient.post<MessageResponseDto>('/auth/reset-password/request', data),

    resetPasswordConfirm: (data: ResetPasswordConfirmDto) =>
        apiClient.post<MessageResponseDto>('/auth/reset-password/confirm', data),
};

// Account Services
export const accountService = {
    getMyAccount: () =>
        apiClient.get<UserProfileDto>('/account/me'),

    updateMyAccount: (data: AccountUpdateDto) =>
        apiClient.patch<UserProfileDto>('/account/me', data),
};

// User Services
export const userService = {
    getUserProfile: (userId: string) =>
        apiClient.get<UserProfileDto>(`/users/${userId}`),
};

// Contribution Services
export const contributionService = {
    submitApplication: (data: ContributionApplicationDto) =>
        apiClient.post<ContributionApplicationResponseDto>('/contrib/applications', data),

    getMyApplicationStatus: () =>
        apiClient.get<ContributionApplicationStatusDto>('/contrib/applications/me'),

    generateClientSecret: () =>
        apiClient.post<ClientSecretResponseDto>('/contrib/secret'),

    getMyContributorInfo: () =>
        apiClient.get<ContributorInfoDto>('/contrib/me'),

    getSessions: () =>
        apiClient.get<ContributorSessionDto>('/contrib/sessions'),

    deleteSessions: () =>
        apiClient.delete<MessageResponseDto>('/contrib/sessions'),
};

// Data Services
export const dataService = {
    // Leaked Data
    getLeakedData: (params: LeakedDataSearchParams) =>
        apiClient.get<PaginatedResponse<LeakedDataDocument>>('/data/leaked', params),

    getLeakedDataDetail: (id: string) =>
        apiClient.get<LeakedDataDocument>(`/data/leaked/${id}`),

    findPersonalData: (data: PersonalDataSearchDto) =>
        apiClient.post<PersonalDataSearchResultDto>('/data/leaked/find', data),

    submitLeakedData: (data: MongoLeakedDataDto) =>
        apiClient.post<{ result: string; reason?: string }>('/data/leaked', data),

    // Vulnerability Data
    getVulnerabilityData: (params: VulnerabilityDataSearchParams) =>
        apiClient.get<PaginatedResponse<VulnerabilityDataDocument>>('/data/vulnerability', params),

    getVulnerabilityDataDetail: (id: string) =>
        apiClient.get<VulnerabilityDataDocument>(`/data/vulnerability/${id}`),

    submitVulnerabilityData: (data: MongoVulnerabilityDataDto) =>
        apiClient.post<{ result: string; reason?: string }>('/data/vulnerability', data),
};

// Export all services
export const api = {
    auth: authService,
    account: accountService,
    user: userService,
    contribution: contributionService,
    data: dataService,
};