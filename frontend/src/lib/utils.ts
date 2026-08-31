import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatShortDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  stepIndex: number;
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    dotClass: 'bg-amber-500',
    stepIndex: 0,
    description: 'Order placed and waiting for warehouse confirmation',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    dotClass: 'bg-blue-500',
    stepIndex: 1,
    description: 'Payment and order confirmed by system',
  },
  PROCESSING: {
    label: 'Processing',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50',
    dotClass: 'bg-indigo-500',
    stepIndex: 2,
    description: 'Items are being picked, packed, and packaged',
  },
  SHIPPED: {
    label: 'Shipped',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
    dotClass: 'bg-purple-500',
    stepIndex: 3,
    description: 'Handed over to carrier transit network',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50',
    dotClass: 'bg-cyan-500',
    stepIndex: 4,
    description: 'Courier is currently delivering package to destination',
  },
  DELIVERED: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
    stepIndex: 5,
    description: 'Package safely delivered to recipient',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    dotClass: 'bg-rose-500',
    stepIndex: -1,
    description: 'Order cancelled and stock inventory restored',
  },
};

export const ORDER_LIFECYCLE_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];
