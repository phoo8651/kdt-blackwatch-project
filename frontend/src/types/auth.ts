export interface SignupRequestDto {
    email: string;
}

export interface SignupVerifyDto {
    email: string;
    code: string;
    username: string;
    password: string;
}

export interface SigninRequestDto {
    email: string;
    password: string;
}

export interface SigninResponseDto {
    accessToken: string;
    expiresAt: string;
    role: string;
}

export interface MfaResponseDto {
    sessionKey: string;
    needMfa: boolean;
    message: string;
}

export interface MfaVerifyDto {
    sessionKey: string;
    code: string;
}

export interface ResetPasswordRequestDto {
    email: string;
}

export interface ResetPasswordConfirmDto {
    email: string;
    code: string;
    password: string;
}