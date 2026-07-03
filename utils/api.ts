
import { auth } from '../firebase/firebase';

const API_BASE_URL = '/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    message?: string;
}

const getHeaders = async () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    let data: ApiResponse<T>;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || data.message || 'Unknown API Error';
        const errorCode = data.error?.code || 'UNKNOWN_ERROR';
        // You can attach code to error object if needed
        const error = new Error(errorMsg) as any;
        error.code = errorCode;
        error.details = data.error?.details;
        throw error;
    }

    return data.data as T;
};

export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return handleResponse<T>(response);
    },

    post: async <T>(endpoint: string, body: any): Promise<T> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse<T>(response);
    },

    put: async <T>(endpoint: string, body: any): Promise<T> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse<T>(response);
    },

    delete: async <T>(endpoint: string): Promise<T> => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse<T>(response);
    },
};
