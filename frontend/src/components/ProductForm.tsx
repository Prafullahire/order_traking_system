'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../lib/types';
import { productsApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { X, Loader2, Save } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedProduct: Product) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!product;
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price !== undefined ? product.price.toString() : '');
      setStock(product.stock !== undefined ? product.stock.toString() : '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('0');
    }
    setValidationErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Product name is required';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (stock === '' || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      errors.stock = 'Stock must be a non-negative integer';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      };

      let result: Product;
      if (isEditing && product) {
        result = await productsApi.update(product.id, payload);
        success(`Product "${result.name}" updated successfully!`);
      } else {
        result = await productsApi.create(payload);
        success(`Product "${result.name}" created successfully!`);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update catalog item details and inventory' : 'Create a new item in your inventory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Gaming Mouse"
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                validationErrors.name
                  ? 'border-rose-400 bg-rose-50/50'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {validationErrors.name && (
              <p className="text-xs text-rose-500 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, features, and warranty..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.99"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  validationErrors.price
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.price && (
                <p className="text-xs text-rose-500 mt-1">{validationErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  validationErrors.stock
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {validationErrors.stock && (
                <p className="text-xs text-rose-500 mt-1">{validationErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-md shadow-brand-500/20 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
