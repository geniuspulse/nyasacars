import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';
import { Store, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Fetch full user and seller details from database
  let dbUser = null;
  let seller = null;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { seller: true },
    });

    if (dbUser?.seller) {
      seller = dbUser.seller;
    } else if (session.user.sellerId) {
      seller = await prisma.seller.findUnique({
        where: { id: session.user.sellerId },
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard user context:', error);
  }

  const userContext = {
    name: dbUser?.name || session.user.name,
    email: dbUser?.email || session.user.email,
    role: dbUser?.role || session.user.role || 'BUYER',
    sellerId: seller?.id || session.user.sellerId,
  };

  const isBuyerWithoutShop = userContext.role === 'BUYER' && !userContext.sellerId;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <DashboardSidebar user={userContext} seller={seller} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Buyer Prompt Banner if no seller profile */}
        {isBuyerWithoutShop && (
          <div className="m-4 lg:m-6 mb-0 p-5 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Become a Seller on Nyasacars</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Free Plan Available
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  You are currently logged in as a Buyer. Upgrade to a Seller account to list cars, create your custom minishop, and manage inquiries.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/minishop"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Setup Seller Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
