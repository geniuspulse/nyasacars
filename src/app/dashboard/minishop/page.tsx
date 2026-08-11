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
  Clock,
  Tag,
  MessageSquare,
  MapPin,
  Plus,
  X,
  Facebook,
  Instagram,
  Twitter,
  Save,
} from 'lucide-react';

interface BusinessHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  [key: string]: string | undefined;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
}

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const DEFAULT_HOURS: BusinessHours = {
  mon: '08:00-17:00',
  tue: '08:00-17:00',
  wed: '08:00-17:00',
  thu: '08:00-17:00',
  fri: '08:00-17:00',
  sat: '09:00-15:00',
  sun: 'Closed',
};

export default function MinishopPage() {
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    logo: '',
    coverImage: '',
    slug: '',
    location: '',
    whatsapp: '',
    address: '',
    specialties: [] as string[],
    businessHours: DEFAULT_HOURS as BusinessHours,
    socialLinks: {} as SocialLinks,
  });

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch('/api/sellers/me');
        if (!res.ok) throw new Error('Failed to load seller profile');
        const data = await res.json();
        const seller = data.seller || data;

        setFormData({
          shopName: seller.shopName || '',
          shopDescription: seller.shopDescription || '',
          logo: seller.logo || '',
          coverImage: seller.coverImage || '',
          slug: seller.shopSlug || seller.slug || '',
          location: seller.location || '',
          whatsapp: seller.whatsapp || '',
          address: seller.address || '',
          specialties: seller.specialties || [],
          businessHours: seller.businessHours || DEFAULT_HOURS,
          socialLinks: seller.socialLinks || {},
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

  const handleHoursChange = (day: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: { ...prev.businessHours, [day]: value },
    }));
    setSuccess(false);
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
    setSuccess(false);
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()],
    }));
    setNewSpecialty('');
    setSuccess(false);
  };

  const removeSpecialty = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== idx),
    }));
    setSuccess(false);
  };

  const handleCopyLink = () => {
    if (!formData.slug) return;
    const url = `${window.location.origin}/sellers/${formData.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/sellers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update minishop settings.');

      const updated = data.seller || data;
      if (updated?.shopSlug) {
        setFormData((prev) => ({ ...prev, slug: updated.shopSlug }));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update shop details.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Storefront Settings...</span>
      </div>
    );
  }

  const publicUrl = formData.slug ? `/sellers/${formData.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Dealer Storefront
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize your independent dealership page — branding, contact, hours, and more.
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
              Your Public Storefront Link
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>{typeof window !== 'undefined' ? window.location.origin : ''}/sellers/{formData.slug}</span>
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
          <span>Storefront updated successfully! Your changes are live.</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Location (City)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Blantyre"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Physical Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Ginnery Corner, Blantyre"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & WhatsApp */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Contact & WhatsApp</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              WhatsApp Number
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="e.g. +265991234567"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Customers will see a WhatsApp button on your storefront that opens a chat with this number.
            </p>
          </div>
        </div>

        {/* Media & Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <span>Branding & Images</span>
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
                placeholder="https://..."
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
                placeholder="https://..."
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

        {/* Specialties */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Tag className="w-5 h-5 text-amber-400" />
            <span>Specialties & Brands</span>
          </h2>

          <div>
            <p className="text-xs text-slate-500 mb-3">
              Add car brands or vehicle types you specialize in. These show as tags on your storefront.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
                placeholder="e.g. Toyota, Luxury SUVs, Japanese Imports"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Business Hours</span>
          </h2>

          <div className="space-y-2.5">
            {DAYS.map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300 w-24 shrink-0">{day.label}</span>
                <input
                  type="text"
                  value={formData.businessHours[day.key] || ''}
                  onChange={(e) => handleHoursChange(day.key, e.target.value)}
                  placeholder="e.g. 08:00-17:00 or Closed"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-5 h-5 text-sky-400" />
            <span>Social Media & Links</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Facebook className="w-3 h-3 inline mr-1" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook || ''}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourshop"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Instagram className="w-3 h-3 inline mr-1" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourshop"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Twitter className="w-3 h-3 inline mr-1" />
                Twitter / X
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter || ''}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourshop"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Globe className="w-3 h-3 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.socialLinks.website || ''}
                onChange={(e) => handleSocialChange('website', e.target.value)}
                placeholder="https://yourshop.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Storefront</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
