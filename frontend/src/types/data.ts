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