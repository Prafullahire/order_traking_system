export type UserRole = 'ADMIN' | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  product?: Product;
}

export interface OrderTracking {
  id: number;
  status: OrderStatus;
  location: string;
  message: string;
  orderId: number;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  user?: User;
  userId?: number;
  items: OrderItem[];
  tracking: OrderTracking[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
}
