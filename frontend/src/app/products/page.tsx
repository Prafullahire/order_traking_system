'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../../lib/api';
import { Product, PaginationMeta } from '../../lib/types';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, Check } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 12,
    totalPages: 1,
    currentPage: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getAll({
        page,
        limit: 12,
        search: search.trim() || undefined,
        inStockOnly: inStockOnly || undefined,
        sortBy,
        sortOrder,
      });

      setProducts(response.data || []);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Failed to load catalog products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, search, inStockOnly, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse premium commercial electronics and high-performance equipment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            {meta.totalItems} {meta.totalItems === 1 ? 'Product Available' : 'Products Available'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* In Stock Toggle */}
          <button
            type="button"
            onClick={() => {
              setInStockOnly((prev) => !prev);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition ${
              inStockOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${
                inStockOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
              }`}
            >
              {inStockOnly && <Check className="w-2.5 h-2.5" />}
            </div>
            <span>In Stock Only</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-2xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'ASC' | 'DESC');
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="createdAt-DESC">Newest First</option>
              <option value="price-ASC">Price: Low to High</option>
              <option value="price-DESC">Price: High to Low</option>
              <option value="name-ASC">Alphabetical (A-Z)</option>
              <option value="stock-DESC">Highest Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Content */}
      {loading ? (
        <LoadingComponent message="Loading products catalog..." />
      ) : error ? (
        <ErrorComponent message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No products matched your criteria
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or removing the stock filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setInStockOnly(false);
              setPage(1);
            }}
            className="mt-4 px-4 py-2 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 text-xs font-bold rounded-xl border border-brand-200 dark:border-brand-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </>
      )}
    </div>
  );
}
