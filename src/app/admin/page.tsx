import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Store,
  Car,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  let totalUsers = 0;
  let totalSellers = 0;
  let totalListings = 0;
  let totalInquiries = 0;
  let recentSignups: any[] = [];
  let recentListings: any[] = [];

  try {
    const [usersCount, sellersCount, listingsCount, inquiriesCount] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.carListing.count(),
      prisma.inquiry.count(),
    ]);

    totalUsers = usersCount;
    totalSellers = sellersCount;
    totalListings = listingsCount;
    totalInquiries = inquiriesCount;

    recentSignups = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    recentListings = await prisma.carListing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        seller: {
          select: {
            shopName: true,
            slug: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('Error loading admin dashboard stats:', err);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Seller Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration
            </h1>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Global metrics, seller management, and full marketplace system activity.
          </p>
        </div>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalUsers}</span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Buyers & Sellers</span>
          </div>
        </div>

        {/* Total Sellers */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Sellers</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalSellers}</span>
            <span className="text-xs text-slate-500">dealerships</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Minishops</span>
          </div>
        </div>

        {/* Total Listings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalListings}</span>
            <span className="text-xs text-slate-500">vehicles</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Marketplace inventory
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Inquiries</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalInquiries}</span>
            <span className="text-xs text-slate-500">messages</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Buyer lead volume
          </div>
        </div>
      </div>

      {/* Grid: Recent Signups & Recent Platform Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Signups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Recent User Signups</span>
            </h2>
          </div>

          {recentSignups.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No recent signups found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-2">User</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSignups.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-white">{user.name || 'Anonymous'}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : user.role === 'SELLER'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Listings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-400" />
              <span>Recent Listings Published</span>
            </h2>
          </div>

          {recentListings.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No recent listings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-2">Vehicle</th>
                    <th className="py-3 px-2">Seller / Store</th>
                    <th className="py-3 px-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-white">{listing.title}</div>
                        <div className="text-xs text-slate-400">
                          {listing.year} {listing.make} {listing.model}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-300">
                        {listing.seller?.shopName || 'Private Seller'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-emerald-400 text-xs">
                        {listing.currency || 'MWK'} {Number(listing.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
