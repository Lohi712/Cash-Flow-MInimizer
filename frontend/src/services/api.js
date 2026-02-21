import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Banks API
export const banksAPI = {
    getAll: () => api.get('/banks'),
    create: (data) => api.post('/banks', data),
    delete: (id) => api.delete(`/banks/${id}`),
};

// Transactions API
export const transactionsAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    create: (data) => api.post('/transactions', data),
    delete: (id) => api.delete(`/transactions/${id}`),
};

// Optimize API
export const optimizeAPI = {
    run: () => api.post('/optimize'),
};

// Analytics API
export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getPrediction: (bankId, days) => api.get(`/analytics/prediction/${bankId}`, { params: { days } }),
    getSummary: (month, year) => api.get('/analytics/summary', { params: { month, year } }),
};

export default api;
