'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

interface InquiryFormProps {
  carListingId: string;
  carTitle?: string;
}

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export default function InquiryForm({ carListingId, carTitle }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Hello, I am interested in this vehicle. Is it still available?',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const quickMessages = [
    'Is this car still available?',
    'I would like to schedule a test drive.',
    'What is your final cash price in MWK?',
    'Is trade-in / swap accepted?',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const setQuickMessage = (msg: string) => {
    setFormData((prev) => ({ ...prev, message: msg }));
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    const validation = inquirySchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carListingId,
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send inquiry. Please try again.');
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'Hello, I am interested in this vehicle. Is it still available?',
      });
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageSquare className="h-5 w-5 text-nyasa-700" />
        <h3 className="text-lg font-bold text-slate-900">Send Seller Inquiry</h3>
      </div>

      {isSuccess ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h4 className="text-base font-bold text-emerald-900">Message Sent Successfully!</h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            The seller has received your message regarding {carTitle || 'this vehicle'} and will reach out to your phone/email shortly.
          </p>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="mt-3 text-xs font-bold text-nyasa-700 hover:underline"
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick presets */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Messages
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuickMessage(msg)}
                  className="text-xs bg-slate-100 hover:bg-nyasa-50 hover:text-nyasa-700 text-slate-700 font-medium px-2.5 py-1 rounded-md transition border border-slate-200/60"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="inquiry-name" className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name *
            </label>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              placeholder="e.g. Tendai Banda"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none ${
                errors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:border-nyasa-700'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="inquiry-email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              placeholder="tendai@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none ${
                errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:border-nyasa-700'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="inquiry-phone" className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number (WhatsApp) *
            </label>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              placeholder="+265 999 000 000"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none ${
                errors.phone
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:border-nyasa-700'
              }`}
            />
            {errors.phone && <p className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>}
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="inquiry-message" className="block text-xs font-bold text-slate-700 mb-1">
              Message *
            </label>
            <textarea
              id="inquiry-message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none ${
                errors.message
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:border-nyasa-700'
              }`}
            />
            {errors.message && <p className="mt-1 text-xs font-semibold text-red-600">{errors.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-nyasa-700 py-3 px-4 text-sm font-bold text-white shadow hover:bg-nyasa-800 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Contact Seller</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            By sending this inquiry, you agree to NyasaCars safety guidelines.
          </p>

        </form>
      )}

    </div>
  );
}
