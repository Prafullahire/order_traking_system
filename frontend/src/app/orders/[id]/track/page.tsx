'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '../../../../lib/api';
import { Order } from '../../../../lib/types';
import TrackingTimeline from '../../../../components/TrackingTimeline';
import OrderStatusBadge from '../../../../components/OrderStatusBadge';
import LoadingComponent from '../../../../components/LoadingComponent';
import ErrorComponent from '../../../../components/ErrorComponent';
import {
  Navigation,
  ArrowLeft,
  RefreshCw,
  Clock,
  Package,
  CheckCircle2,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderTracking = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to load tracking info:', err);
      setError(err.response?.data?.message || 'Could not load tracking data for this order.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId && !isNaN(orderId)) {
      fetchOrderTracking();
    } else {
      setError('Invalid order ID.');
      setLoading(false);
    }
  }, [orderId, fetchOrderTracking]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
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
                Live Order Tracking
              </h1>
              {order && <OrderStatusBadge status={order.status} size="md" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time milestone progression for order{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {order?.orderNumber || '...'}
              </span>
            </p>
          </div>
        </div>

        {order && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrderTracking(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>

            <Link
              href={`/orders/${order.id}`}
              className="px-4 py-2.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 text-xs font-bold rounded-2xl transition"
            >
              View Invoice
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingComponent message="Connecting to carrier tracking feed..." />
      ) : error || !order ? (
        <ErrorComponent message={error || 'Tracking data unavailable'} onRetry={() => fetchOrderTracking()} />
      ) : (
        <div className="space-y-8">
          {/* Tracking Timeline Component */}
          <TrackingTimeline
            currentStatus={order.status}
            trackingHistory={order.tracking || []}
          />
        </div>
      )}
    </div>
  );
}
