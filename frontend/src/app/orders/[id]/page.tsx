'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '../../../lib/api';
import { Order } from '../../../lib/types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import OrderStatusBadge from '../../../components/OrderStatusBadge';
import LoadingComponent from '../../../components/LoadingComponent';
import ErrorComponent from '../../../components/ErrorComponent';
import {
  Package,
  ArrowLeft,
  Navigation,
  Calendar,
  User,
  ShoppingBag,
  Clock,
  XCircle,
  FileText,
  Truck,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError('Invalid order ID parameter.');
      setLoading(false);
      return;
    }

    ordersApi
      .getById(orderId)
      .then((data) => setOrder(data))
      .catch((err) => {
        console.error('Failed to load order details:', err);
        setError(err.response?.data?.message || 'Could not load order details');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) return;

    setCancelling(true);
    try {
      const updated = await ordersApi.cancel(order.id);
      setOrder(updated);
      success('Order cancelled and inventory successfully restocked.');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    order &&
    (order.status === 'PENDING' || order.status === 'CONFIRMED') &&
    order.status !== 'CANCELLED';

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Order Details
                </h1>
                {order && <OrderStatusBadge status={order.status} size="md" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracking Number: <span className="font-bold text-slate-700 dark:text-slate-300">{order?.orderNumber || '...'}</span>
              </p>
            </div>
          </div>

          {order && (
            <div className="flex items-center gap-3">
              <Link
                href={`/orders/${order.id}/track`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-500/25 transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Live Tracking</span>
              </Link>

              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold rounded-2xl transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingComponent message="Loading detailed order breakdown..." />
        ) : error || !order ? (
          <ErrorComponent message={error || 'Order not found'} />
        ) : (
          <div className="space-y-6">
            {/* Top Order Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1">
                <span className="text-xs font-bold text-slate-400">Order Placed</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1">
                <span className="text-xs font-bold text-slate-400">Customer</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.user?.name || user?.name || 'Customer'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {order.user?.email || user?.email}
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1">
                <span className="text-xs font-bold text-slate-400">Grand Total</span>
                <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            {/* Purchased Items Table */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <span>Purchased Items ({order.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-extrabold flex items-center justify-center text-xs">
                        {item.product?.name ? item.product.name.slice(0, 2).toUpperCase() : 'IT'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.product?.name || `Product #${item.productId}`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Unit Price: {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Qty: <strong className="text-slate-900 dark:text-white">{item.quantity}</strong>
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white w-24 text-right">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total summary footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-500">Invoice Subtotal</span>
                <span className="text-slate-900 dark:text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Tracking Quick Preview Card */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Need live location updates?
                  </h4>
                  <p className="text-xs text-slate-500">
                    View complete milestone history and dispatch checkpoints.
                  </p>
                </div>
              </div>

              <Link
                href={`/orders/${order.id}/track`}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition text-center"
              >
                Open Full Timeline
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
