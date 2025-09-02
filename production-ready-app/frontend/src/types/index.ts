export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}