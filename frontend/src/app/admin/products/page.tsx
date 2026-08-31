'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../../../lib/api';
import { Product, PaginationMeta } from '../../../lib/types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useToast } from '../../../context/ToastContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Sidebar from '../../../components/Sidebar';
import ProductForm from '../../../components/ProductForm';
import Pagination from '../../../components/Pagination';
import LoadingComponent from '../../../components/LoadingComponent';
import ErrorComponent from '../../../components/ErrorComponent';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsApi.getAll({
        page,
        limit: 10,
        search: search.trim() || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setProducts(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err.response?.data?.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      await productsApi.delete(deletingProduct.id);
      success(`Product "${deletingProduct.name}" removed from catalog.`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex gap-8 pb-12">
        <Sidebar mode="admin" />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Top Title & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Product Inventory Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Create, update, and manage inventory units and pricing
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-500/25 transition duration-150 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </form>

          {/* Products Table */}
          {loading ? (
            <LoadingComponent message="Retrieving catalog products..." />
          ) : error ? (
            <ErrorComponent message={error} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your query. Click &apos;Add New Product&apos; above to create one.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6">Created At</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {products.map((product) => {
                      const isOutOfStock = product.stock <= 0;
                      const isLowStock = product.stock > 0 && product.stock <= 5;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                {product.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-slate-400 max-w-xs truncate">
                                  {product.description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </td>

                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full whitespace-nowrap text-xs font-bold border ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isLowStock
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {product.stock} units {isOutOfStock && '(Out of Stock)'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(product.createdAt)}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingProduct(product)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
            </>
          )}
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductForm
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchProducts()}
      />

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Product &quot;{deletingProduct.name}&quot;?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove this product from the catalog?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
