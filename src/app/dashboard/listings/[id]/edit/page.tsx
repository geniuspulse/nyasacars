'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import {
  Car,
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Sparkles
} from 'lucide-react';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().min(1, 'Currency is required'),
  condition: z.enum(['USED', 'NEW', 'CERTIFIED']),
  bodyType: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON']),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']),
  mileage: z.coerce.number().min(0, 'Mileage must be positive'),
  color: z.string().min(1, 'Color is required'),
  engineSize: z.string().optional(),
  features: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.string().url('Must be a valid image URL')).min(1, 'At least one image URL is required'),
  status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'DRAFT']).optional(),
});

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    currency: 'MWK',
    condition: 'USED',
    bodyType: 'SEDAN',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    mileage: '',
    color: '',
    engineSize: '',
    features: '',
    description: '',
    status: 'ACTIVE',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}`);
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('You do not have permission to edit this listing.');
          }
          if (res.status === 404) {
            throw new Error('Listing not found.');
          }
          throw new Error('Failed to load listing data.');
        }

        const data = await res.json();
        const listing = data.listing || data;

        let parsedImages: string[] = [];
        if (Array.isArray(listing.images)) {
          parsedImages = listing.images;
        } else if (typeof listing.images === 'string' && listing.images.startsWith('[')) {
          try {
            parsedImages = JSON.parse(listing.images);
          } catch {
            parsedImages = [listing.images];
          }
        } else if (typeof listing.images === 'string') {
          parsedImages = [listing.images];
        }

        let formattedFeatures = '';
        if (Array.isArray(listing.features)) {
          formattedFeatures = listing.features.join(', ');
        } else if (typeof listing.features === 'string') {
          formattedFeatures = listing.features;
        }

        setFormData({
          title: listing.title || '',
          make: listing.make || '',
          model: listing.model || '',
          year: listing.year || new Date().getFullYear(),
          price: listing.price ? String(listing.price) : '',
          currency: listing.currency || 'MWK',
          condition: listing.condition || 'USED',
          bodyType: listing.bodyType || 'SEDAN',
          transmission: listing.transmission || 'AUTOMATIC',
          fuelType: listing.fuelType || 'PETROL',
          mileage: listing.mileage !== undefined ? String(listing.mileage) : '',
          color: listing.color || '',
          engineSize: listing.engineSize || '',
          features: formattedFeatures,
          description: listing.description || '',
          status: listing.status || 'ACTIVE',
        });

        setImages(parsedImages);
      } catch (err: any) {
        setServerError(err.message || 'Error fetching listing details');
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput);
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: '' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, images: 'Please enter a valid image URL' }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const payload = {
      ...formData,
      year: Number(formData.year),
      price: Number(formData.price),
      mileage: Number(formData.mileage) || 0,
      images,
    };

    const validationResult = listingSchema.safeParse(payload);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          features: formData.features
            ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || data.error || 'Failed to update listing.');
        setLoading(false);
        return;
      }

      router.push('/dashboard/listings');
      router.refresh();
    } catch (err: any) {
      setServerError(err?.message || 'An error occurred while updating listing.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading vehicle listing...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Listings</span>
          </Link>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Edit Vehicle Listing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Update pricing, vehicle specifications, status, or photo gallery.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Overview & Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Car className="w-5 h-5 text-blue-400" />
            <span>Basic Vehicle Information</span>
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. 2020 Toyota Fortuner 2.8 GD-6 Automatic"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Listing Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SOLD">SOLD</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.make && <p className="mt-1 text-xs text-red-400">{errors.make}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.model && <p className="mt-1 text-xs text-red-400">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                {errors.year && <p className="mt-1 text-xs text-red-400">{errors.year}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Specs & Pricing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Pricing & Technical Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="MWK">MWK (Malawian Kwacha)</option>
                <option value="USD">USD ($)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="USED">Used</option>
                <option value="NEW">Brand New</option>
                <option value="CERTIFIED">Certified Pre-Owned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Body Type *
              </label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="TRUCK">Pickup / Truck</option>
                <option value="VAN">Van / Bus</option>
                <option value="COUPE">Coupe</option>
                <option value="CONVERTIBLE">Convertible</option>
                <option value="WAGON">Wagon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Transmission *
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mileage (km)
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Exterior Color *
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {errors.color && <p className="mt-1 text-xs text-red-400">{errors.color}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Engine Capacity
              </label>
              <input
                type="text"
                name="engineSize"
                value={formData.engineSize}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Features & Description */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Vehicle Features & Description</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Features (Comma separated)
            </label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="Leather Seats, Reverse Camera, Keyless Entry, Sunroof"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Description *
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          </div>
        </div>

        {/* Section 4: Images */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <span>Vehicle Photos (URL Links) *</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>
          {errors.images && <p className="text-xs text-red-400">{errors.images}</p>}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/listings"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
