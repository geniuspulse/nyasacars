'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Store,
  CreditCard,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    sellerId?: string | null;
  };
  seller?: {
    shopName?: string | null;
    plan?: string | null;
    slug?: string | null;
  } | null;
}

export default function DashboardSidebar({ user, seller }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'My Listings',
      href: '/dashboard/listings',
      icon: Car,
      exact: false,
    },
    {
      label: 'Add Listing',
      href: '/dashboard/listings/new',
      icon: PlusCircle,
      exact: false,
    },
    {
      label: 'Minishop',
      href: '/dashboard/minishop',
      icon: Store,
      exact: false,
    },
    {
      label: 'Subscription',
      href: '/dashboard/subscription',
      icon: CreditCard,
      exact: false,
    },
    {
      label: 'Inquiries',
      href: '/dashboard/inquiries',
      icon: MessageSquare,
      exact: false,
    },
  ];

  const planName = seller?.plan || 'FREE';

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-white">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span>Nyasa<span className="text-blue-500">cars</span></span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-bold text-white">
              <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="tracking-tight">Nyasa<span className="text-blue-500">cars</span></span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Seller / Shop Badge */}
          {seller?.shopName && (
            <div className="px-4 py-3 mx-3 mt-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Storefront</div>
              <div className="text-sm font-semibold text-white truncate">{seller.shopName}</div>
              {seller.slug && (
                <Link
                  href={`/sellers/${seller.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
                >
                  <span>View public shop</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
                </Link>
              );
            })}

            {/* Admin Dashboard Link if Admin */}
            {user?.role === 'ADMIN' && (
              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Plan Upgrade Box */}
          <div className="p-3 mx-3 mb-3 bg-gradient-to-br from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-medium">Current Plan</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {planName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2.5">
              {planName === 'FREE' ? '3 listings max' : planName === 'PRO' ? '15 listings allowed' : 'Unlimited listings'}
            </p>
            {planName !== 'PREMIUM' && (
              <Link
                href="/dashboard/subscription"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Plan</span>
              </Link>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
