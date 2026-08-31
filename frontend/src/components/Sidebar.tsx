'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Navigation,
  ShoppingBag,
  ShieldAlert,
  User,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  mode?: 'admin' | 'customer';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode = 'customer' }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const adminLinks = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Products', href: '/admin/products', icon: Boxes },
    { label: 'Manage Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Track Order', href: '/track', icon: Navigation },
  ];

  const customerLinks = [
    { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Product Catalog', href: '/products', icon: ShoppingBag },
    { label: 'My Orders', href: '/orders', icon: ClipboardList },
    { label: 'Track Order', href: '/track', icon: Navigation },
  ];

  const links = mode === 'admin' ? adminLinks : customerLinks;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* User Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-brand-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {user?.name || 'Guest User'}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 border border-brand-200 dark:border-brand-800">
              {user?.role || 'CUSTOMER'}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {mode === 'admin' ? 'Admin Portal' : 'Customer Workspace'}
          </p>

          {links.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
