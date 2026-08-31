'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersApi } from '../../lib/api';
import { AdminStats, Order } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import OrderTable from '../../components/OrderTable';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import {
  DollarSign,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      ordersApi.getAdminStats(),
      ordersApi.getAll({ limit: 5, sortOrder: 'DESC' }),
    ])
      .then(([statsData, ordersData]) => {
        setStats(statsData);
        setRecentOrders(ordersData.data || []);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setError(err.response?.data?.message || 'Failed to load administrator data');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex gap-8 pb-12">
        <Sidebar mode="admin" />

        <div className="flex-1 min-w-0 space-y-8">
          {/* Header Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-brand-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator Control Center</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Operations &amp; Fulfillment Overview
              </h1>
              <p className="text-xs text-slate-300 max-w-md">
                Manage live logistics, update order milestones, inspect catalog inventory, and track sales revenue.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/products"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl transition shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
              <Link
                href="/admin/orders"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl backdrop-blur-md border border-white/20 transition"
              >
                Manage All Orders
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingComponent message="Loading administration metrics..." />
          ) : error ? (
            <ErrorComponent message={error} />
          ) : stats ? (
            <>
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Total Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real-time settled sales</span>
                  </p>
                </div>

                {/* Total Orders */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats.totalOrders}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Across all customers</p>
                </div>

                {/* Total Products */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Catalog Products</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {stats.totalProducts}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Active inventory items</p>
                </div>

                {/* Low Stock Alerts */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Low Stock Alert</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-amber-600">
                    {stats.lowStockProducts}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Items with &le; 5 units</p>
                </div>
              </div>

              {/* Order Status Breakdown Badges */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Order Status Pipeline Breakdown
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      Pending
                    </span>
                    <p className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                      {stats.pendingOrders}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      Processing
                    </span>
                    <p className="text-xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                      {stats.processingOrders}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      In Transit
                    </span>
                    <p className="text-xl font-extrabold text-purple-900 dark:text-purple-200 mt-1">
                      {stats.shippedOrders}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Delivered
                    </span>
                    <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                      {stats.deliveredOrders}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      Cancelled
                    </span>
                    <p className="text-xl font-extrabold text-rose-900 dark:text-rose-200 mt-1">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Latest Incoming Orders
                    </h2>
                    <p className="text-xs text-slate-500">Live order queue</p>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Manage All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <OrderTable orders={recentOrders} isAdmin={true} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
