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