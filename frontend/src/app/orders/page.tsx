'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../../lib/api';
import { Order, OrderStatus, PaginationMeta } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import OrderTable from '../../components/OrderTable';
import Pagination from '../../components/Pagination';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import { Search, Filter, AlertTriangle } from 'lucide-react';

export default function MyOrdersPage() {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  });

  // Cancel order modal
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getAll({
        page,
        limit: 10,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
        sortOrder: 'DESC',
      });

      setOrders(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelling(true);
    try {
      await ordersApi.cancel(orderToCancel.id);
      success(`Order ${orderToCancel.orderNumber} was cancelled and inventory restored.`);
      setOrderToCancel(null);
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel order.';
      toastError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setCancelling(false);
    }
  };

  const statusTabs: { label: string; value: OrderStatus | 'ALL' }[] = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <div className="flex gap-8 pb-12">
        <Sidebar mode="customer" />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track status, review invoices, and monitor parcel shipments
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedStatus === tab.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number (e.g. ORD-20260827-1001)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </form>

          {/* Orders Table */}
          {loading ? (
            <LoadingComponent message="Retrieving orders..." />
          ) : error ? (
            <ErrorComponent message={error} onRetry={fetchOrders} />
          ) : (
            <>
              <OrderTable
                orders={orders}
                isAdmin={false}
                onCancelOrder={(ord) => setOrderToCancel(ord)}
              />
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cancel Order {orderToCancel.orderNumber}?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel this order? The reserved inventory stock will be restored immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
