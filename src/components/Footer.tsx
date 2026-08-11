import React from 'react';
import Link from 'next/link';
import { Car, Mail, Phone, MapPin, ShieldCheck, ExternalLink, Store, PlusCircle, CreditCard, LayoutDashboard } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nyasa-950 text-nyasa-100 border-t border-nyasa-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 inline-flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nyasa-700 text-white shadow">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Nyasa<span className="text-nyasa-500">Cars</span>
              </span>
            </Link>
            <p className="text-sm text-nyasa-100/80 leading-relaxed">
              Malawi&apos;s premier multi-tenant car marketplace. Connecting verified dealerships, private sellers, and vehicle buyers across Lilongwe, Blantyre, and Mzuzu.
            </p>
            <div className="flex items-center gap-2 text-xs text-nyasa-500 font-semibold bg-nyasa-900/60 p-2.5 rounded-lg border border-nyasa-800">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>100% Verified Car Listings &amp; Direct Imports</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide uppercase text-xs text-nyasa-500">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-nyasa-100/80">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-white transition">
                  Browse All Cars
                </Link>
              </li>
              <li>
                <Link href="/cars?condition=NEW" className="hover:text-white transition">
                  New Cars
                </Link>
              </li>
              <li>
                <Link href="/cars?condition=USED" className="hover:text-white transition">
                  Pre-Owned Vehicles
                </Link>
              </li>
              <li>
                <Link href="/cars?bodyType=SUV" className="hover:text-white transition">
                  SUVs &amp; 4x4 Off-Roaders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Sellers */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide uppercase text-xs text-nyasa-500">
              For Sellers &amp; Dealers
            </h3>
            <ul className="space-y-2.5 text-sm text-nyasa-100/80">
              <li>
                <Link href="/dashboard" className="hover:text-white transition flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/minishop" className="hover:text-white transition flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  Customize Storefront
                </Link>
              </li>
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-white transition flex items-center gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5" />
                  List a Vehicle
                </Link>
              </li>
              <li>
                <Link href="/dashboard/subscription" className="hover:text-white transition flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition flex items-center gap-1.5">
                  Dealer Login <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide uppercase text-xs text-nyasa-500">
              Contact &amp; Support
            </h3>
            <ul className="space-y-3 text-sm text-nyasa-100/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-nyasa-500 shrink-0 mt-0.5" />
                <span>Lilongwe Area 4 &amp; Limbe, Blantyre, Malawi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-nyasa-500 shrink-0" />
                <span>+265 999 123 456 / +265 888 765 432</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-nyasa-500 shrink-0" />
                <span>support@nyasacars.mw</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-nyasa-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-nyasa-100/60">
          <p>© {currentYear} NyasaCars Malawi. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/safety-tips" className="hover:text-white transition">Safety Tips</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
