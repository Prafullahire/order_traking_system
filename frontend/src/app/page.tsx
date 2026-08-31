'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsApi } from '../lib/api';
import { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import {
  Package,
  Search,
  Truck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getAll({ limit: 4, inStockOnly: true })
      .then((res) => {
        setFeaturedProducts(res.data || []);
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/track?number=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 text-center max-w-4xl mx-auto">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Order Lifecycle &amp; Dispatch Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Manage Orders with{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Precision
          </span>{' '}
          &amp; Track in Real Time.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Full-stack inventory allocation, automated order orchestration, and multi-checkpoint
          shipping timeline visibility for customers and administrators.
        </p>

        {/* Quick Order Search Bar */}
        <div className="mt-10 max-w-xl mx-auto">
          <form
            onSubmit={handleTrackSubmit}
            className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking # (e.g. ORD-20260827-1001)"
              className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 px-2"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-brand-500/25 transition duration-150 flex items-center gap-2 shrink-0"
            >
              <span>Track Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl hover:opacity-90 transition shadow-sm"
          >
            Browse Products
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Customer &amp; Admin Login
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            7-Stage Live Tracking
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Visual milestone tracking from Pending, Confirmed, Processing to Shipped and Delivered with real-time location logs.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Atomic Inventory Sync
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Transactional stock deduction when placing multi-item orders with automated inventory restoration upon cancellation.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Role-Based Authorization
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict JWT authentication with dual roles (ADMIN and CUSTOMER), preventing unauthorized order or product tampering.
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Featured Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Top gear in stock with instant fulfillment
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 bg-slate-100 dark:bg-slate-800/40 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
