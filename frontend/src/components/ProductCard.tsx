'use client';

import React, { useState } from 'react';
import { Product } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Minus, Check, PackageCheck, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const increment = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700/60 transition-all duration-300">
      {/* Visual Header / Graphic Card */}
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 via-indigo-50/50 to-brand-50/80 dark:from-slate-800 dark:via-slate-800/80 dark:to-brand-950/40 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-24 h-24 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-md flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300">
          <PackageCheck className="w-12 h-12" />
        </div>

        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-full backdrop-blur-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-full backdrop-blur-sm">
              <AlertTriangle className="w-3 h-3" />
              Only {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-full backdrop-blur-sm">
              In Stock ({product.stock})
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 min-h-[32px]">
            {product.description || 'High-performance commercial equipment engineered for quality.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 shadow-xs hover:bg-slate-50 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={increment}
                  disabled={quantity >= product.stock}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 shadow-xs hover:bg-slate-50 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : isAdded
                ? 'bg-emerald-600 text-white scale-[0.98]'
                : 'bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-brand-500/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : isOutOfStock ? (
              <span>Unavailable</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
