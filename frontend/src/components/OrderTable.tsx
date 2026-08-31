'use client';

import React from 'react';
import Link from 'next/link';
import { Order } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/utils';
import OrderStatusBadge from './OrderStatusBadge';
import { Eye, Navigation, MoreVertical, XCircle, ArrowRight } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  isAdmin?: boolean;
  onUpdateStatus?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isAdmin = false,
  onUpdateStatus,
  onCancelOrder,
}) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Eye className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Orders Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'There are currently no orders matching your filter criteria.'
            : "You haven't placed any orders yet. Check out our products to get started."}
        </p>
        {!isAdmin && (
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
            <th className="py-4 px-6">Order Number</th>
            {isAdmin && <th className="py-4 px-6">Customer</th>}
            <th className="py-4 px-6">Items</th>
            <th className="py-4 px-6">Total Amount</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Date</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {orders.map((order) => {
            const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const canCancel =
              (order.status === 'PENDING' || order.status === 'CONFIRMED') &&
              order.status !== 'CANCELLED';

            return (
              <tr
                key={order.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Order Number */}
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-[11px] text-slate-400">ID #{order.id}</span>
                  </div>
                </td>

                {/* Customer (Admin only) */}
                {isAdmin && (
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {order.user?.name || 'Customer'}
                      </span>
                      <span className="text-xs text-slate-400">{order.user?.email || 'N/A'}</span>
                    </div>
                  </td>
                )}

                {/* Items */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {totalQty} {totalQty === 1 ? 'item' : 'items'}
                  </span>
                </td>

                {/* Total */}
                <td className="py-4 px-6">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <OrderStatusBadge status={order.status} size="sm" />
                </td>

                {/* Date */}
                <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      title="View Details"
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/orders/${order.id}/track`}
                      title="Track Timeline"
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      <Navigation className="w-4 h-4" />
                    </Link>

                    {isAdmin && onUpdateStatus && (
                      <button
                        onClick={() => onUpdateStatus(order)}
                        title="Update Status"
                        className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 rounded-xl text-xs font-bold transition"
                      >
                        Update
                      </button>
                    )}

                    {!isAdmin && canCancel && onCancelOrder && (
                      <button
                        onClick={() => onCancelOrder(order)}
                        title="Cancel Order"
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
