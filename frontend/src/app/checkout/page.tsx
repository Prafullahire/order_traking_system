'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ordersApi } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import ProtectedRoute from '../../components/ProtectedRoute';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [zip, setZip] = useState('97477');
  const [notes, setNotes] = useState('Please ring door bell upon delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment Test States
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('123');
  const [nameOnCard, setNameOnCard] = useState('Test Customer');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      error('Your cart is empty. Please add items to create an order.');
      return;
    }

    setIsSubmitting(true);
    setIsProcessingPayment(true);
    
    try {
      // Simulate Payment Gateway delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      success('Test Payment Successful! Authorizing transaction...');

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await ordersApi.create(orderPayload);
      clearCart();
      success(`Order ${createdOrder.orderNumber} successfully placed!`);
      router.push(`/orders/${createdOrder.id}/track`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      const strMsg = Array.isArray(msg) ? msg.join(', ') : msg;
      error(strMsg);
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Checkout &amp; Place Order
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review selected multi-item inventory and confirm order creation
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
            <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Your cart is currently empty
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You need to select at least one product before placing an order.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-brand-500/25 transition"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Items Summary & Delivery Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Card */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-600" />
                    <span>Order Items ({totalItems})</span>
                  </h3>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    + Add More Items
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-extrabold flex items-center justify-center text-xs">
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {product.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Unit: {formatCurrency(product.price)} • In stock: {product.stock}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="w-20 text-right font-extrabold text-sm text-slate-900 dark:text-white">
                          {formatCurrency(Number(product.price) * quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information Card */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Shipping &amp; Delivery Destination
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Delivery Instructions &amp; Courier Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information Card (Test Gateway) */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Payment Details
                    </h3>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Test Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      CVV
                    </label>
                    <input
                      type="password"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment & Summary Column */}
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Customer Account</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {user?.name}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Email Confirmation</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {user?.email}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Standard Express Shipping</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-extrabold">
                    <span className="text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-brand-50/70 dark:bg-brand-950/40 rounded-2xl border border-brand-200/80 dark:border-brand-800/40 text-[11px] text-brand-700 dark:text-brand-300 flex items-start gap-2">
                  <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Stock will be atomically reserved upon order submission with real-time tracking tracking enabled.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-xl shadow-brand-500/25 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isProcessingPayment ? 'Processing Payment...' : 'Creating Order & Deducting Stock...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay {formatCurrency(totalAmount)} &amp; Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
