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