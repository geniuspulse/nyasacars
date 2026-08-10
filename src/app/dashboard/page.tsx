import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  Eye,
  MessageSquare,
  CheckCircle2,
  PlusCircle,
  Store,
  CreditCard,
  ArrowRight,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get seller ID from session or user record
  let sellerId = session.user.sellerId;

  if (!sellerId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { seller: true },
    });
    sellerId = user?.seller?.id || null;
  }

  // Fetch stats if seller exists
  let totalListings = 0;
  let activeListings = 0;
  let totalViews = 0;
  let totalInquiries = 0;
  let recentListings: any[] = [];
  let recentInquiries: any[] = [];
  let sellerInfo: any = null;

  if (sellerId) {
    try {
      sellerInfo = await prisma.seller.findUnique({
        where: { id: sellerId },
      });

      const [listingsCount, activeCount, viewsResult, inquiriesCount] = await Promise.all([
        prisma.carListing.count({ where: { sellerId } }),
        prisma.carListing.count({ where: { sellerId, status: 'ACTIVE' } }),
        prisma.carListing.aggregate({
          where: { sellerId },
          _sum: { views: true },
        }),
        prisma.inquiry.count({
          where: {
            OR: [
              { sellerId },
              { listing: { sellerId } },
            ],
          },
        }),
      ]);

      totalListings = listingsCount;
      activeListings = activeCount;
      totalViews = viewsResult._sum.views || 0;
      totalInquiries = inquiriesCount;

      recentListings = await prisma.carListing.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      recentInquiries = await prisma.inquiry.findMany({
        where: {
          OR: [
            { sellerId },
            { listing: { sellerId } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          listing: {
            select: {
              title: true,
              make: true,
              model: true,
            },
          },
        },
      });
    } catch (err) {
      console.error('Error loading seller dashboard data:', err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-medium">{session.user.name || 'Seller'}</span>. Here is what is happening with your listings.
          </p>
        </div>

        {sellerId && (
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Listing</span>
          </Link>
        )}
      </div>

      {/* No Seller Account Notice */}
      {!sellerId && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Setup Your Dealership / Seller Profile</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            You need a seller profile to publish car listings, manage inquiries, and customize your online minishop.
          </p>
          <Link
            href="/dashboard/minishop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <span>Create Seller Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalListings}</span>
            <span className="text-xs text-slate-500">vehicles</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-blue-400 font-medium">Plan:</span> {sellerInfo?.plan || 'FREE'}
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Listings</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeListings}</span>
            <span className="text-xs text-slate-500">live on market</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visible to buyers</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Views</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalViews.toLocaleString()}</span>
            <span className="text-xs text-slate-500">impressions</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Across all active listings
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inquiries</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalInquiries}</span>
            <span className="text-xs text-slate-500">messages</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Buyer leads & contact requests
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/listings/new"
            className="p-4 bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-center group transition-all"
          >
            <PlusCircle className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200 block">Add Listing</span>
          </Link>

          <Link
            href="/dashboard/minishop"
            className="p-4 bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-center group transition-all"
          >
            <Store className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200 block">Edit Minishop</span>
          </Link>

          <Link
            href="/dashboard/inquiries"
            className="p-4 bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-center group transition-all"
          >
            <MessageSquare className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200 block">View Inquiries</span>
          </Link>

          <Link
            href="/dashboard/subscription"
            className="p-4 bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-center group transition-all"
          >
            <CreditCard className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200 block">Subscription & Ads</span>
          </Link>
        </div>
      </div>

      {/* Content Grid: Recent Listings & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-400" />
              <span>Recent Listings</span>
            </h2>
            <Link
              href="/dashboard/listings"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No listings posted yet. Start by creating your first car listing!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-2">Vehicle</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-semibold text-white">{listing.title}</div>
                        <div className="text-xs text-slate-400">
                          {listing.year} • {listing.make} {listing.model}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 font-medium text-emerald-400">
                        {listing.currency || 'MWK'} {Number(listing.price).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            listing.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right text-slate-300 font-medium">
                        {listing.views || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Inquiries (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Recent Inquiries</span>
            </h2>
            <Link
              href="/dashboard/inquiries"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{inquiry.name || inquiry.buyerName || 'Interested Buyer'}</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    &ldquo;{inquiry.message}&rdquo;
                  </p>

                  <div className="text-[11px] text-blue-400 font-medium truncate">
                    Re: {inquiry.listing?.title || inquiry.listing?.make + ' ' + inquiry.listing?.model || 'Vehicle Listing'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
