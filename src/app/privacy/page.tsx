import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — NyasaCars',
  description: 'How NyasaCars collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-nyasa-700 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy</h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide when registering an account, listing a vehicle, or contacting a seller. This includes your name, email, phone number, and listing details. We also collect usage data such as pages visited and search queries.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve our marketplace services, facilitate communication between buyers and sellers, verify dealer accounts, and send important platform notifications. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption and secure data storage to protect your information. Access to personal data is restricted to authorized personnel only.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Third-Party Services</h2>
            <p>We use trusted third-party services for payments (Stripe), hosting, and analytics. These providers have their own privacy policies governing your data when using their services.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting support@nyasacars.mw. You may also deactivate your account through your dashboard settings.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact</h2>
            <p>For privacy-related questions, email support@nyasacars.mw or call +265 999 123 456.</p>
          </section>
          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">Last updated: August 2026</p>
        </div>
      </div>
    </div>
  );
}
