export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
}

export interface AuthRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}