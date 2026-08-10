import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteListingButton from '@/components/DeleteListingButton';
import {
  Car,
  PlusCircle,
  Edit,
  Star,
  Eye,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';

export default async function ListingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  let sellerId = session.user.sellerId;

  if (!sellerId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { seller: true },
    });
    sellerId = user?.seller?.id || null;
  }

  let sellerPlan = 'FREE';
  let listings: any[] = [];

  if (sellerId) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { plan: true },
    });
    if (seller?.plan) sellerPlan = seller.plan;

    listings = await prisma.listing.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Plan limits: FREE=3, PRO=15, PREMIUM=unlimited
  const PLAN_LIMITS: Record<string, number> = {
    FREE: 3,
    PRO: 15,
    PREMIUM: Infinity,
  };

  const limit = PLAN_LIMITS[sellerPlan] ?? 3;
  const isLimitReached = listings.length >= limit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            My Vehicle Listings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your active inventory, update details, and monitor view analytics.
          </p>
        </div>

        {isLimitReached ? (
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-600/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Post More ({listings.length}/{limit === Infinity ? '∞' : limit})</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        )}
      </div>

      {/* Plan Limit Prompt Banner */}
      {isLimitReached && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Listing Limit Reached ({listings.length}/{limit})</div>
              <div className="text-xs text-amber-300/80 mt-0.5">
                You have used all available listing slots for your <span className="font-bold uppercase">{sellerPlan}</span> plan. Upgrade to PRO or PREMIUM to add more vehicles.
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/subscription"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Plan Usage Indicator */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Plan:</span>
          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-full uppercase">
            {sellerPlan}
          </span>
        </div>
        <div className="text-slate-400">
          Used <span className="text-white font-bold">{listings.length}</span> of{' '}
          <span className="text-white font-bold">{limit === Infinity ? 'Unlimited' : `${limit} listings`}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {listings.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-slate-400">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No listings found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              You haven&apos;t added any cars to your inventory yet. Click below to add your first vehicle.
            </p>
            <Link
              href="/dashboard/listings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Listing</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Vehicle</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Views</th>
                  <th className="py-4 px-4">Featured</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {listings.map((listing) => {
                  const imageUrl =
                    Array.isArray(listing.images) && listing.images.length > 0
                      ? listing.images[0]
                      : typeof listing.images === 'string' && listing.images.startsWith('[')
                      ? JSON.parse(listing.images)?.[0]
                      : typeof listing.images === 'string'
                      ? listing.images
                      : null;

                  return (
                    <tr key={listing.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {imageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={imageUrl}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Car className="w-6 h-6 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/listings/${listing.id}/edit`}
                              className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1"
                            >
                              {listing.title}
                            </Link>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {listing.year} • {listing.make} {listing.model} • {listing.transmission || 'Automatic'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-emerald-400 whitespace-nowrap">
                        {listing.currency || 'MWK'} {Number(listing.price).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            listing.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : listing.status === 'SOLD'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {listing.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{listing.views || 0}</span>
                        </div>
                      </td>

                      {/* Featured Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {listing.isFeatured || listing.featured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Standard</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/listings/${listing.id}/edit`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Listing"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteListingButton
                            listingId={listing.id}
                            listingTitle={listing.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
