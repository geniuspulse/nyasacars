import React from 'react';
import { Metadata } from 'next';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Safety Tips — NyasaCars',
  description: 'Stay safe when buying or selling cars in Malawi with these tips.',
};

export default function SafetyTipsPage() {
  const doList = [
    'Meet the seller in a public, well-lit place during daylight hours',
    'Inspect the vehicle thoroughly before any payment',
    'Request and verify the vehicle registration and logbook',
    'Take a mechanic with you for a professional inspection',
    'Verify the seller identity matches the vehicle documents',
    'Use bank transfers for payments and get a written receipt',
    'Check the vehicle history including accidents and mileage',
  ];

  const dontList = [
    'Never pay a deposit before seeing the vehicle in person',
    'Do not share your banking PIN or passwords with anyone',
    'Avoid deals that seem too good to be true — they usually are',
    'Do not meet alone in remote or unfamiliar locations',
    'Never wire money to overseas accounts for local car purchases',
    'Do not skip the test drive — a test drive reveals hidden issues',
    'Avoid sellers who pressure you to pay quickly or secretly',
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-nyasa-700 rounded-xl">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Safety Tips</h1>
            <p className="text-sm text-slate-500 mt-1">Stay safe when buying or selling vehicles in Malawi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <CheckCircle2 className="h-5 w-5" />
              Always Do These
            </h2>
            <ul className="space-y-3">
              {doList.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <XCircle className="h-5 w-5" />
              Never Do These
            </h2>
            <ul className="space-y-3">
              {dontList.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-nyasa-50 border border-nyasa-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-nyasa-900 mb-2">Report Suspicious Activity</h3>
          <p className="text-sm text-slate-600">
            If you encounter a fraudulent listing or suspicious seller, please report it immediately to <span className="font-bold text-nyasa-700">support@nyasacars.mw</span> or call <span className="font-bold text-nyasa-700">+265 999 123 456</span>. We take all reports seriously and act quickly to protect our community.
          </p>
        </div>
      </div>
    </div>
  );
}
