'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ordersApi } from '../../lib/api';
import { Order } from '../../lib/types';
import TrackingTimeline from '../../components/TrackingTimeline';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import { Search, Navigation, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('number') || '';

  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialNumber) {
      handleSearch(initialNumber);
    }
  }, [initialNumber]);

  const handleSearch = async (num: string) => {
    const query = num.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await ordersApi.trackByNumber(query);
      setOrder(data);
    } catch (err: any) {
      console.error('Track lookup failed:', err);
      setOrder(null);
      setError(
        err.response?.data?.message ||
          `No order found with tracking number "${query}". Please verify your order number and try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(orderNumber);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <Navigation className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Shipment
        </h1>
        <p className="text-xs text-slate-500">
          Enter your unique order tracking number to see real-time dispatch milestones.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-20260827-1001"
            className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 px-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-brand-500/25 transition duration-150 flex items-center gap-2 shrink-0 disabled:opacity-60"
          >
            <span>{loading ? 'Searching...' : 'Track'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Quick Suggestion */}
        <div className="mt-3 text-center">
          <p className="text-[11px] text-slate-400">
            Try demo tracking code:{' '}
            <button
              onClick={() => {
                setOrderNumber('ORD-20260827-1001');
                handleSearch('ORD-20260827-1001');
              }}
              className="font-bold text-brand-600 hover:underline"
            >
              ORD-20260827-1001
            </button>
          </p>
        </div>
      </div>

      {/* Results Area */}
      {loading ? (
        <LoadingComponent message="Retrieving order milestones from network..." />
      ) : error ? (
        <ErrorComponent title="Order Lookup Failed" message={error} />
      ) : order ? (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          {/* Order Header Summary */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order Tracking
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {order.orderNumber}
              </h2>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          <TrackingTimeline
            currentStatus={order.status}
            trackingHistory={order.tracking || []}
          />
        </div>
      ) : searched ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 text-sm">
          No order data available for the provided tracking code.
        </div>
      ) : null}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<LoadingComponent fullPage message="Loading tracking portal..." />}>
      <TrackContent />
    </Suspense>
  );
}
