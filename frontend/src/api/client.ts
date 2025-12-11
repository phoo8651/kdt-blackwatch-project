import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { AuthStore } from '../utils/authHelpers';

interface ApiErrorResponse {
    message?: string;
    error?: string;
    timestamp?: string;
    path?: string;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        // 개발환경에서는 프록시 사용, 프로덕션에서는 직접 연결
        const baseURL = import.meta.env.DEV
            ? '/api'  // 개발환경: Vite 프록시 사용
            : import.meta.env.VITE_API_BASE_URL;

        if (!import.meta.env.DEV && !baseURL) {
            throw new Error('VITE_API_BASE_URL is not configured for production');
        }

        if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
            console.log('🔧 API Client baseURL:', baseURL, 'isDev:', import.meta.env.DEV);
        }

        this.client = axios.create({
            baseURL,
            timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const token = AuthStore.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Debug logging in development
                if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
                        headers: config.headers,
                        data: config.data,
                        params: config.params,
                    });
                }

                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                // Debug logging in development
                if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
                    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                        status: response.status,
                        data: response.data,
                    });
                }
                return response;
            },
            async (error: AxiosError<ApiErrorResponse>) => {
                const { response, config } = error;

                // Debug logging in development
                if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
                    console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
                        status: response?.status,
                        data: response?.data,
                        message: error.message,
                        code: error.code,
                    });
                }

                // Handle network errors
                if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                    toast.error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
                    return Promise.reject(error);
                }

                // Get status code safely
                const statusCode = response?.status;

                // Handle specific status codes
                if (statusCode === 401) {
                    AuthStore.clearAuth();
                    window.location.href = '/auth/signin';
                    toast.error('인증이 만료되었습니다. 다시 로그인해주세요.');
                    return Promise.reject(error);
                }

                if (statusCode === 403) {
                    toast.error('접근 권한이 없습니다.');
                    return Promise.reject(error);
                }

                if (statusCode === 404) {
                    toast.error('요청한 리소스를 찾을 수 없습니다.');
                    return Promise.reject(error);
                }

                if (statusCode === 429) {
                    toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
                    return Promise.reject(error);
                }

                if (statusCode && statusCode >= 500) {
                    toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    return Promise.reject(error);
                }

                // Network error or timeout
                if (!response) {
                    if (error.code === 'ECONNABORTED') {
                        toast.error('요청 시간이 초과되었습니다.');
                    } else {
                        toast.error('네트워크 연결을 확인해주세요.');
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async get<T, P = Record<string, unknown>>(url: string, params?: P): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T, D = unknown>(url: string, data?: D): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data);
        return response.data;
    }

    async patch<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url);
        return response.data;
    }

    // File upload with progress
    async uploadFile<T>(
        url: string,
        file: File,
        onProgress?: (progressEvent: any) => void
    ): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        const response: AxiosResponse<T> = await this.client.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress,
        });

        return response.data;
    }
}

export const apiClient = new ApiClient();