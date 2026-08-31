'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersApi } from '../../lib/api';
import { Order } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import OrderTable from '../../components/OrderTable';
import LoadingComponent from '../../components/LoadingComponent';
import {
  Package,
  Truck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Navigation,
  Clock,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getAll({ limit: 5, sortOrder: 'DESC' })
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error('Failed to load dashboard orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const inTransitCount = orders.filter(
    (o) =>
      o.status === 'PROCESSING' ||
      o.status === 'SHIPPED' ||
      o.status === 'OUT_FOR_DELIVERY',
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const activeShipment = orders.find(
    (o) =>
      o.status !== 'DELIVERED' &&
      o.status !== 'CANCELLED',
  );

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <div className="flex gap-8 pb-12">
        <Sidebar mode="customer" />

        <div className="flex-1 min-w-0 space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-brand-200">
                Customer Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-brand-200/80 max-w-md">
                Monitor your packages, place new orders, and follow status updates in real time.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <Link
                href="/products"
                className="px-5 py-2.5 bg-white text-brand-900 hover:bg-brand-50 text-xs font-bold rounded-2xl transition shadow-md shadow-slate-950/20"
              >
                Browse Catalog
              </Link>
              <Link
                href="/orders"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl backdrop-blur-md border border-white/20 transition"
              >
                View History
              </Link>
            </div>

            <Package className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 pointer-events-none" />
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">Total Orders</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalOrders}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">In Transit</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {inTransitCount}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">Delivered</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {deliveredCount}
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">Total Spent</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          {/* Active Shipment Focus Card */}
          {activeShipment && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800/60 rounded-3xl shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center animate-pulse">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                      Active In-Transit Order
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeShipment.orderNumber}
                    </h3>
                  </div>
                </div>

                <Link
                  href={`/orders/${activeShipment.id}/track`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/20"
                >
                  <span>Track Live Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeShipment.tracking && activeShipment.tracking.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <span>{activeShipment.tracking[0].message}</span>
                  </div>
                  <span className="text-slate-400">
                    {formatDate(activeShipment.tracking[0].createdAt)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recent Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                <p className="text-xs text-slate-500">Your latest purchases and shipments</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingComponent message="Loading recent orders..." />
            ) : (
              <OrderTable orders={orders} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
