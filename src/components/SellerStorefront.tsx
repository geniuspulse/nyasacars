'use client';

import { useState } from 'react';
import CarCard from '@/components/CarCard';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Car,
  ShieldCheck,
  ArrowLeft,
  Share2,
  MessageCircle,
  Clock,
  Tag,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  ChevronDown,
  Send,
  CheckCircle2,
  Loader2,
  Eye,
  ShoppingBag,
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  condition: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  mileage: number | null;
  color: string;
  location: string | null;
  images: string[];
  status: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  seller: any;
}

interface Seller {
  id: string;
  shopName: string;
  shopSlug: string;
  shopDescription: string | null;
  logo: string | null;
  coverImage: string | null;
  isVerified: boolean;
  location: string | null;
  plan: string;
  whatsapp: string | null;
  address: string | null;
  specialties: string[];
  businessHours: Record<string, string> | null;
  socialLinks: Record<string, string> | null;
  totalSold: number;
  totalViews: number;
  createdAt: string;
  user: {
    phone: string | null;
    email: string | null;
    name: string | null;
  };
}

interface Props {
  seller: Seller;
  listings: Listing[];
}

const DAYS: { key: string; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

type SortOption = 'newest' | 'price-asc' | 'price-desc';

export default function SellerStorefront({ seller, listings }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Contact form state
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const coverImage =
    seller.coverImage ||
    'https://images.unsplash.com/photo-1562519819-016930ada31b?w=1600&auto=format&fit=crop&q=80';

  const logoImage =
    seller.logo ||
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80';

  const memberYear = seller.createdAt ? new Date(seller.createdAt).getFullYear() : 2023;

  // Sort listings
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return Number(a.price) - Number(b.price);
      case 'price-desc':
        return Number(b.price) - Number(a.price);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const whatsappUrl = seller.whatsapp
    ? `https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello ${seller.shopName}, I'm interested in your vehicles listed on NyasaCars. Can you share more details?`
      )}`
    : null;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      const res = await fetch(`/api/sellers/${seller.shopSlug}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send inquiry');
      }

      setFormSuccess(true);
      setForm({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
    } catch (err: any) {
      setFormError(err?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const socialIcons: Record<string, { icon: any; label: string }> = {
    facebook: { icon: Facebook, label: 'Facebook' },
    instagram: { icon: Instagram, label: 'Instagram' },
    twitter: { icon: Twitter, label: 'Twitter' },
    website: { icon: Globe, label: 'Website' },
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* COVER BANNER */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverImage} alt={seller.shopName} className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute top-4 left-4 sm:left-8 z-10 flex gap-2">
          <a
            href="/cars"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Listings</span>
          </a>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* SHOP PROFILE CARD */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Logo + Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoImage}
                alt={seller.shopName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {seller.shopName}
                  </h1>
                  {seller.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-nyasa-50 border border-nyasa-200 text-nyasa-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Dealer
                    </span>
                  )}
                </div>

                {seller.location && (
                  <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-nyasa-700 shrink-0" />
                    <span>{seller.location}</span>
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Member since {memberYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              )}
              {seller.user?.phone && (
                <a
                  href={`tel:${seller.user.phone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-nyasa-700 px-5 py-3 text-sm font-bold text-white shadow hover:bg-nyasa-800 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </a>
              )}
              {seller.user?.email && (
                <a
                  href={`mailto:${seller.user.email}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <Mail className="h-4 w-4 text-nyasa-700" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {seller.shopDescription && (
            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {seller.shopDescription}
            </p>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <Car className="h-5 w-5 text-nyasa-700 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block font-semibold">Inventory</span>
              <span className="text-xl font-black text-nyasa-700">{listings.length}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <ShoppingBag className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block font-semibold">Cars Sold</span>
              <span className="text-xl font-black text-emerald-600">{seller.totalSold || 0}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block font-semibold">Total Views</span>
              <span className="text-xl font-black text-blue-600">{(seller.totalViews || 0).toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <ShieldCheck className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <span className="text-xs text-slate-400 block font-semibold">Status</span>
              <span className="text-sm font-bold text-emerald-600 block mt-1">
                {seller.isVerified ? 'Verified' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* SPECIALTIES */}
        {seller.specialties && seller.specialties.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-amber-500" />
              Specialties & Brands
            </h3>
            <div className="flex flex-wrap gap-2">
              {seller.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center bg-nyasa-50 border border-nyasa-200 text-nyasa-800 text-sm font-semibold px-3 py-1.5 rounded-lg"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY + SIDEBAR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Vehicles Available
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  All vehicles offered directly by {seller.shopName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-nyasa-700 bg-nyasa-50 px-3 py-1 rounded-full border border-nyasa-200">
                  {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
                </span>
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Sort</span>
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 w-44">
                      <button
                        onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition ${sortBy === 'newest' ? 'text-nyasa-700 font-bold' : 'text-slate-700'}`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => { setSortBy('price-asc'); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition ${sortBy === 'price-asc' ? 'text-nyasa-700 font-bold' : 'text-slate-700'}`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        onClick={() => { setSortBy('price-desc'); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition ${sortBy === 'price-desc' ? 'text-nyasa-700 font-bold' : 'text-slate-700'}`}
                      >
                        Price: High to Low
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sortedListings.map((car) => (
                  <CarCard key={car.id} car={car as any} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <Car className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No active vehicles listed currently</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This dealer currently has no active inventory. Check back soon or contact them directly using the buttons above.
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR: Business Hours + Social + Contact Form */}
          <div className="space-y-6">
            {/* Business Hours */}
            {seller.businessHours && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Business Hours
                </h3>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const hours = seller.businessHours?.[day.key];
                    const isClosed = !hours || hours.toLowerCase() === 'closed';
                    return (
                      <div key={day.key} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">{day.label}</span>
                        <span className={isClosed ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'}>
                          {hours || 'Closed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social Links */}
            {seller.socialLinks && Object.keys(seller.socialLinks).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Globe className="h-4 w-4 text-sky-500" />
                  Connect
                </h3>
                <div className="space-y-2">
                  {Object.entries(seller.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const social = socialIcons[platform];
                    const Icon = social?.icon || Globe;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-nyasa-700 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="capitalize">{social?.label || platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Send className="h-4 w-4 text-nyasa-700" />
                Contact {seller.shopName}
              </h3>

              {formSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">Inquiry Sent!</p>
                  <p className="text-xs text-slate-500">
                    {seller.shopName} will get back to you soon.
                  </p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="text-xs text-nyasa-700 font-semibold hover:underline mt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.buyerName}
                    onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-nyasa-500 transition"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={form.buyerEmail}
                    onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-nyasa-500 transition"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone number"
                    value={form.buyerPhone}
                    onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-nyasa-500 transition"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="I'm interested in..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-nyasa-500 transition resize-none"
                  />
                  {formError && (
                    <p className="text-xs text-red-500 font-medium">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-nyasa-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-nyasa-800 disabled:opacity-50 transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
