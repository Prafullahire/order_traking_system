'use client';

import React from 'react';
import { OrderStatus } from '../lib/types';
import { ORDER_STATUS_CONFIG } from '../lib/utils';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Send,
  CheckCheck,
  XCircle,
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  };

  const getStatusIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    switch (status) {
      case 'PENDING':
        return <Clock className={iconSize} />;
      case 'CONFIRMED':
        return <CheckCircle2 className={iconSize} />;
      case 'PROCESSING':
        return <Package className={iconSize} />;
      case 'SHIPPED':
        return <Truck className={iconSize} />;
      case 'OUT_FOR_DELIVERY':
        return <Send className={iconSize} />;
      case 'DELIVERED':
        return <CheckCheck className={iconSize} />;
      case 'CANCELLED':
        return <XCircle className={iconSize} />;
      default:
        return <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-150 ${sizeClasses[size]} ${config.badgeClass} ${className}`}
    >
      {showIcon && getStatusIcon()}
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
