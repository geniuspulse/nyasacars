import React from 'react';
import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — NyasaCars',
  description: 'The terms and conditions for using the NyasaCars marketplace platform.',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-nyasa-700 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms of Service</h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By using NyasaCars, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform. These terms apply to all users including buyers, sellers, and dealers.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. Sellers must be authorized to sell the vehicles they list.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Listing Guidelines</h2>
            <p>Vehicle listings must be accurate and include genuine photos and descriptions. Misleading listings, duplicate postings, or fraudulent activity will result in account suspension. NyasaCars reserves the right to remove any listing that violates these guidelines.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Transactions</h2>
            <p>NyasaCars is a marketplace platform that connects buyers and sellers. We facilitate listings and inquiries but are not party to the actual vehicle sale transaction. All sales agreements are between the buyer and seller directly.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Subscriptions & Payments</h2>
            <p>Sellers may subscribe to PRO or PREMIUM plans for enhanced features. Subscription fees are billed through Stripe. Featured listing fees and ad credits are non-refundable once used. Cancellations take effect at the end of the current billing period.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Limitation of Liability</h2>
            <p>NyasaCars is not liable for the accuracy of listings, the condition of vehicles, or disputes between buyers and sellers. We provide the platform as-is without warranties of merchantability or fitness for a particular purpose.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Contact</h2>
            <p>For questions about these terms, email support@nyasacars.mw.</p>
          </section>
          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">Last updated: August 2026</p>
        </div>
      </div>
    </div>
  );
}
