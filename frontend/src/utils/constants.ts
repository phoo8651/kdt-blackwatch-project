export const API_ENDPOINTS = {
    AUTH: {
        SIGNUP_REQUEST: '/auth/signup/request',
        SIGNUP_VERIFY: '/auth/signup/verify',
        SIGNIN: '/auth/signin',
        MFA: '/auth/mfa',
        MFA_RESEND: '/auth/mfa/resend',
        ENABLE_MFA: '/auth/mfa/enable',
        DISABLE_MFA: '/auth/mfa/disable',
        RESET_PASSWORD_REQUEST: '/auth/reset-password/request',
        RESET_PASSWORD_CONFIRM: '/auth/reset-password/confirm',
    },
    ACCOUNT: {
        ME: '/account/me',
    },
    USER: {
        PROFILE: '/users',
    },
    CONTRIBUTION: {
        APPLICATIONS: '/contrib/applications',
        SECRET: '/contrib/secret',
        INFO: '/contrib/me',
        SESSIONS: '/contrib/sessions',
    },
    DATA: {
        LEAKED: '/data/leaked',
        VULNERABILITY: '/data/vulnerability',
        PERSONAL_SEARCH: '/data/leaked/find',
    },
} as const;

export const USER_ROLES = {
    USER: 'USER',
    CONTRIBUTOR: 'CONTRIBUTOR',
    ADMIN: 'ADMIN',
} as const;

export const APPLICATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPT: 'ACCEPT',
    TEMPORARY_ACCEPT: 'TEMPORARY_ACCEPT',
    REJECT: 'REJECT',
} as const;