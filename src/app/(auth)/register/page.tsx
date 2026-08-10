'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Car, User, Mail, Phone, Lock, Store, AlertCircle, Loader2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

const registerSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  shopName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'SELLER') {
    return !!data.shopName && data.shopName.trim().length >= 2;
  }
  return true;
}, {
  message: 'Shop name is required for sellers',
  path: ['shopName'],
});

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'BUYER' | 'SELLER'>('SELLER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const payload = { ...formData, role };
    const validationResult = registerSchema.safeParse(payload);

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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role,
          shopName: role === 'SELLER' ? formData.shopName : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white group">
            <div className="p-2.5 bg-blue-600 rounded-xl group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="tracking-tight">Nyasa<span className="text-blue-500">cars</span></span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join Malawi&apos;s premium digital car marketplace
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          {serverError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Role Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                  role === 'SELLER'
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Store className="w-6 h-6 mb-2 text-blue-400" />
                <span className="font-semibold">I want to sell cars</span>
                <span className="text-[11px] text-slate-400 mt-1">Car Dealership / Seller</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all ${
                  role === 'BUYER'
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-6 h-6 mb-2 text-emerald-400" />
                <span className="font-semibold">I&apos;m looking for a car</span>
                <span className="text-[11px] text-slate-400 mt-1">Buyer Account</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Banda"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+265 999 123 456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>
            </div>

            {/* Seller Shop Name */}
            {role === 'SELLER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Dealership / Shop Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="Blantyre Auto Motors"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.shopName && <p className="mt-1 text-xs text-red-400">{errors.shopName}</p>}
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
