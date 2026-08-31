import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Link from 'next/link';
import { Package, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Tracking  | Order Management and Real-time Tracking System',
  description:
    'Full-stack real-time order processing, inventory allocation, and multi-checkpoint tracking platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>

              {/* Modern Footer */}
              <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Order Tracking  Enterprise Suite
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <Link href="/products" className="hover:text-brand-600 transition">
                      Products
                    </Link>
                    <Link href="/track" className="hover:text-brand-600 transition">
                      Track Shipment
                    </Link>
                    <Link href="/login" className="hover:text-brand-600 transition">
                      Account Access
                    </Link>
                  </div>

                  <p className="flex items-center gap-1">
                    Crafted with precision &amp; Next.js + NestJS
                  </p>
                </div>
              </footer>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
