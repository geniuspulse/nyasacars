'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Cars', href: '/cars' },
    { name: 'For Sellers', href: '/sellers' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nyasa-700 text-white shadow-md shadow-nyasa-700/20 group-hover:bg-nyasa-800 transition-colors">
            <Car className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Nyasa<span className="text-nyasa-700">Cars</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? 'text-nyasa-700 font-bold'
                    : 'text-slate-600 hover:text-nyasa-700'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-nyasa-700 transition"
          >
            <User className="h-4 w-4 text-slate-500" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-nyasa-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-nyasa-800 transition duration-150"
          >
            <span>Sell Your Car</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 hover:text-nyasa-700 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition ${
                    active
                      ? 'bg-nyasa-50 text-nyasa-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-nyasa-700'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-nyasa-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-nyasa-800"
            >
              <span>Sell Your Car</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
