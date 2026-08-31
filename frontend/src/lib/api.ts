import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  Order,
  OrderTracking,
  PaginatedResponse,
  Product,
  AdminStats,
  OrderStatus,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('om_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't auto-redirect if we are on the login or register pages
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && !path.includes('/track')) {
        localStorage.removeItem('om_auth_token');
        localStorage.removeItem('om_auth_user');
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    inStockOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const res = await api.get<PaginatedResponse<Product>>('/products', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },
  create: async (data: { name: string; description?: string; price: number; stock: number }) => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },
  update: async (
    id: number,
    data: { name?: string; description?: string; price?: number; stock?: number },
  ) => {
    const res = await api.patch<Product>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<{ message: string }>(`/products/${id}`);
    return res.data;
  },
};

export const ordersApi = {
  create: async (data: { items: { productId: number; quantity: number }[] }) => {
    const res = await api.post<Order>('/orders', data);
    return res.data;
  },
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    const res = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },
  trackByNumber: async (orderNumber: string) => {
    const res = await api.get<Order>(`/orders/track/number/${orderNumber}`);
    return res.data;
  },
  updateStatus: async (
    id: number,
    data: { status: OrderStatus; location?: string; message?: string },
  ) => {
    const res = await api.patch<Order>(`/orders/${id}/status`, data);
    return res.data;
  },
  cancel: async (id: number) => {
    const res = await api.delete<Order>(`/orders/${id}`);
    return res.data;
  },
  getAdminStats: async () => {
    const res = await api.get<AdminStats>('/orders/stats/overview');
    return res.data;
  },
};

export const orderTrackingApi = {
  addCheckpoint: async (
    orderId: number,
    data: { status: OrderStatus; location: string; message: string; updateOrderStatus?: boolean },
  ) => {
    const res = await api.post<OrderTracking>(`/orders/${orderId}/tracking`, data);
    return res.data;
  },
  getByOrderId: async (orderId: number) => {
    const res = await api.get<OrderTracking[]>(`/orders/${orderId}/tracking`);
    return res.data;
  },
};

export default api;
