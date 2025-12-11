// Common types
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

export interface MessageResponseDto {
    message: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// Auth types
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

// User types
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

// Contribution types
export interface ContributionApplicationDto {
    contact: string;
    handle: string;
    jobs: string;
    motivation: string;
    law: boolean;
    license: boolean;
}

export interface ContributionApplicationResponseDto {
    userId: string;
    status: string;
    createdAt: string;
}

export interface ContributionApplicationStatusDto {
    userId: string;
    clientId: string;
    status: string;
    jobs: string;
    motivation: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientSecretResponseDto {
    clientId: string;
    clientSecret: string;
    createdAt: string;
    expiresAt: string;
}

export interface ClientSecretInfoDto {
    createdAt: string;
    expiresAt: string;
}

export interface ContributorInfoDto {
    userId: string;
    clientId: string;
    clientSecret: ClientSecretInfoDto;
    status: string;
}

// MongoDB Session types
export interface MongoSessionInfoDto {
    sessionId: string;
    clientId: string;
    connectionString: string;
    databaseName: string;
    username: string;
    password: string;
    createdAt: string;
    expiresAt: string;
    permissions: string[];
}

export interface ContributorSessionDto {
    sessionId: string;
    clientId: string;
    ip: string;
    createdAt: string;
    expiresAt: string;
}

export interface MongoSessionCreateOptions {
    additionalHours?: number;
}

export interface MongoSessionExtendOptions {
    additionalHours: number;
}

// Data types
export interface LeakedDataDocument {
    id: string;
    clientId: string;
    host: string;
    path: string;
    title: string;
    author: string;
    uploadDate: string;
    leakType: string;
    recordsCount: number;
    iocs: string;
    price: string;
    article: string;
    ref: string[];
    createdAt: string;
}

export interface VulnerabilityDataDocument {
    id: string;
    clientId: string;
    host: string;
    path: string;
    title: string;
    author: string;
    uploadDate: string;
    cveIds: string[];
    cvss: string;
    vulnerabilityClass: string[];
    products: string[];
    exploitationTechnique: string[];
    article: string;
    ref: string[];
    createdAt: string;
}

export interface PersonalDataSearchDto {
    emails?: string[];
    names?: string[];
}

export interface PersonalDataMatchDto {
    email?: string;
    name?: string;
    found: boolean;
    leakIds: string[];
}

export interface PersonalDataSearchResultDto {
    matches: PersonalDataMatchDto[];
    totalFound: number;
}

export interface MongoLeakedDataDto {
    clientId: string;
    host: string;
    path: string;
    title: string;
    author: string;
    uploadDate: string;
    leakType: string;
    recordsCount?: number;
    iocs?: string;
    price?: string;
    article: string;
    ref?: string[];
    leakedEmail?: string[];
    leakedName?: string[];
}

export interface MongoVulnerabilityDataDto {
    clientId: string;
    host: string;
    path: string;
    title: string;
    author: string;
    uploadDate: string;
    cveIds?: string[];
    cvss?: string;
    vulnerabilityClass?: string[];
    products?: string[];
    exploitationTechnique?: string[];
    article: string;
    ref?: string[];
}

// Search Parameters
export interface LeakedDataSearchParams {
    from?: string;
    to?: string;
    sort?: string;
    page?: number;
    limit?: number;
    host?: string;
    pathContains?: string;
    titleContains?: string;
    author?: string;
    recordMin?: number;
    recordMax?: number;
    iocContains?: string;
    q?: string;
    projection?: string;
}

export interface VulnerabilityDataSearchParams {
    from?: string;
    to?: string;
    sort?: string;
    page?: number;
    limit?: number;
    host?: string;
    pathContains?: string;
    titleContains?: string;
    author?: string;
    cve?: string;
    cvssMin?: number;
    cvssMax?: number;
    vulnClass?: string;
    q?: string;
    projection?: string;
}