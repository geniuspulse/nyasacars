import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  User,
  Mail,
  Phone,
  Car,
  Clock,
  Filter,
  ExternalLink,
  Inbox
} from 'lucide-react';

interface InquiriesPageProps {
  searchParams?: {
    status?: string;
  };
}

export default async function InquiriesPage({ searchParams }: InquiriesPageProps) {
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

  const currentFilter = searchParams?.status || 'ALL';

  let inquiries: any[] = [];

  if (sellerId) {
    const whereClause: any = {
      OR: [
        { sellerId },
        { listing: { sellerId } },
      ],
    };

    if (currentFilter !== 'ALL') {
      whereClause.status = currentFilter;
    }

    try {
      inquiries = await prisma.inquiry.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      });
    } catch (err) {
      console.error('Error loading inquiries:', err);
    }
  }

  const filters = ['ALL', 'NEW', 'READ', 'REPLIED', 'CLOSED'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Buyer Inquiries
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and respond to messages from buyers interested in your inventory.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </span>
        {filters.map((status) => {
          const isActive = currentFilter === status;
          return (
            <Link
              key={status}
              href={`/dashboard/inquiries${status === 'ALL' ? '' : `?status=${status}`}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </Link>
          );
        })}
      </div>

      {/* Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-4 bg-slate-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No inquiries found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {currentFilter !== 'ALL'
                ? `No inquiries matching status "${currentFilter}".`
                : 'You have not received any buyer messages yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Buyer</th>
                  <th className="py-4 px-4">Contact Details</th>
                  <th className="py-4 px-4">Vehicle Listing</th>
                  <th className="py-4 px-4">Message</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {inquiries.map((inquiry) => {
                  const buyerName = inquiry.name || inquiry.buyerName || 'Anonymous Buyer';
                  const buyerEmail = inquiry.email || inquiry.buyerEmail || 'N/A';
                  const buyerPhone = inquiry.phone || inquiry.buyerPhone || 'N/A';
                  const listingTitle =
                    inquiry.listing?.title ||
                    (inquiry.listing ? `${inquiry.listing.year} ${inquiry.listing.make} ${inquiry.listing.model}` : 'General Inquiry');

                  return (
                    <tr key={inquiry.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Buyer Name */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-white">{buyerName}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{buyerEmail}</span>
                        </div>
                        {buyerPhone !== 'N/A' && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{buyerPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Car Listing */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                          <Car className="w-3.5 h-3.5 text-blue-500" />
                          <span>{listingTitle}</span>
                        </div>
                      </td>

                      {/* Message Excerpt */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {inquiry.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            inquiry.status === 'NEW'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : inquiry.status === 'REPLIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : inquiry.status === 'READ'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {inquiry.status || 'NEW'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-right whitespace-nowrap text-xs text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
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
