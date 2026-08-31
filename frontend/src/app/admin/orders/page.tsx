'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ordersApi, orderTrackingApi } from '../../../lib/api';
import { Order, OrderStatus, PaginationMeta } from '../../../lib/types';
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from '../../../lib/utils';
import { useToast } from '../../../context/ToastContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Sidebar from '../../../components/Sidebar';
import OrderTable from '../../../components/OrderTable';
import Pagination from '../../../components/Pagination';
import LoadingComponent from '../../../components/LoadingComponent';
import ErrorComponent from '../../../components/ErrorComponent';
import {
  ClipboardList,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  Navigation,
  MapPin,
  MessageSquare,
  Save,
} from 'lucide-react';

export default function AdminOrdersPage() {
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

  // Status update modal state
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

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
      console.error('Failed to load admin orders:', err);
      setError(err.response?.data?.message || 'Failed to load order management data');
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

  const handleOpenStatusModal = (order: Order) => {
    setUpdatingOrder(order);
    setNewStatus(order.status);
    setLocation('Regional Logistics Facility');
    setMessage(`Status updated to ${order.status}`);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    setIsSubmittingStatus(true);
    try {
      await ordersApi.updateStatus(updatingOrder.id, {
        status: newStatus,
        location: location.trim() || 'Central Sorting Hub',
        message: message.trim() || `Order status transitioned to ${newStatus}`,
      });

      success(`Order ${updatingOrder.orderNumber} status updated to ${newStatus}`);
      setUpdatingOrder(null);
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      toastError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const statusList: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex gap-8 pb-12">
        <Sidebar mode="admin" />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Order Fulfillment &amp; Dispatch
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review customer orders, transition lifecycle milestones, and append tracking updates
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedStatus === 'ALL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Orders
            </button>

            {statusList.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedStatus === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {ORDER_STATUS_CONFIG[st]?.label || st}
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
              placeholder="Search by order #, customer name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </form>

          {/* Table */}
          {loading ? (
            <LoadingComponent message="Loading orders database..." />
          ) : error ? (
            <ErrorComponent message={error} onRetry={fetchOrders} />
          ) : (
            <>
              <OrderTable
                orders={orders}
                isAdmin={true}
                onUpdateStatus={(ord) => handleOpenStatusModal(ord)}
              />
              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </>
          )}
        </div>
      </div>

      {/* Update Order Status & Checkpoint Modal */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Update Order Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order {updatingOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUpdatingOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Order Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {statusList.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_CONFIG[st]?.label || st}
                    </option>
                  ))}
                </select>
                {newStatus === 'CANCELLED' && (
                  <p className="text-xs text-amber-600 mt-1 font-semibold">
                    ⚠️ Setting status to CANCELLED will automatically restore reserved stock for this order.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Checkpoint Facility Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Regional Fulfillment Center, Austin, TX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tracking Milestone Message *
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Package sorted and placed on outbound courier dispatch."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUpdatingOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStatus}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition disabled:opacity-60"
                >
                  {isSubmittingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Milestone...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Update Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
