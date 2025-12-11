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