export interface UserProfileDto {
    userId: string;
    email?: string;
    username: string;
    emailVerified?: boolean;
    mfaEnabled?: boolean;
    locale?: string;
    timeZone?: string;
    roles?: string[];
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
}

export interface AccountUpdateDto {
    username?: string;
    locale?: string;
    timeZone?: string;
}