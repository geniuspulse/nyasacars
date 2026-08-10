'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Copy,
  Check,
  Globe,
  FileText
} from 'lucide-react';

export default function MinishopPage() {
  const [fetching, setFetching] = useState(true);
  const [saving, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    logo: '',
    coverImage: '',
    slug: '',
    phone: '',
    whatsapp: '',
    address: '',
  });

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch('/api/sellers/me');
        if (!res.ok) {
          throw new Error('Failed to load seller profile');
        }
        const data = await res.json();
        const seller = data.seller || data;

        setFormData({
          shopName: seller.shopName || '',
          shopDescription: seller.shopDescription || seller.description || '',
          logo: seller.logo || seller.logoUrl || '',
          coverImage: seller.coverImage || seller.coverUrl || '',
          slug: seller.slug || '',
          phone: seller.phone || '',
          whatsapp: seller.whatsapp || '',
          address: seller.address || '',
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching minishop settings');
      } finally {
        setFetching(false);
      }
    };

    fetchSellerProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleCopyLink = () => {
    if (!formData.slug) return;
    const url = `${window.location.origin}/shops/${formData.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/sellers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update minishop settings.');
      }

      const updated = data.seller || data;
      if (updated?.slug) {
        setFormData((prev) => ({ ...prev, slug: updated.slug }));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update shop details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Minishop Settings...</span>
      </div>
    );
  }

  const publicUrl = formData.slug ? `/shops/${formData.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Minishop Customization
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize your digital car dealership storefront and public branding.
          </p>
        </div>

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors border border-slate-700 shrink-0"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        )}
      </div>

      {/* Live Public URL Card */}
      {formData.slug && (
        <div className="p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Your Public Shop Link
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>{typeof window !== 'undefined' ? window.location.origin : ''}/shops/{formData.slug}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Minishop details updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Store Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="w-5 h-5 text-blue-400" />
            <span>Storefront Profile</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Shop Name *
              </label>
              <input
                type="text"
                name="shopName"
                required
                value={formData.shopName}
                onChange={handleChange}
                placeholder="e.g. Blantyre Auto Motors"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Shop Description / Bio
              </label>
              <textarea
                name="shopDescription"
                rows={4}
                value={formData.shopDescription}
                onChange={handleChange}
                placeholder="Describe your dealership, specialized vehicle brands, importing services, physical location, etc."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Media & Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <span>Branding & Images (URL)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Logo Image URL
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/logo-..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {formData.logo && (
                <div className="mt-3 w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cover / Banner Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/banner-..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {formData.coverImage && (
                <div className="mt-3 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Minishop...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
