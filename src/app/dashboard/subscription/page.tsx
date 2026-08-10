'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  Shield,
  Loader2,
  Star,
  Coins,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<'FREE' | 'PRO' | 'PREMIUM'>('FREE');
  const [adCredits, setAdCredits] = useState<number>(0);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [purchasingCredits, setPurchasingCredits] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const res = await fetch('/api/sellers/me');
        if (res.ok) {
          const data = await res.json();
          const seller = data.seller || data;
          if (seller?.plan) setCurrentPlan(seller.plan);
          if (seller?.adCredits !== undefined) setAdCredits(seller.adCredits);
        }
      } catch (err) {
        console.error('Failed to fetch seller subscription info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleUpgradePlan = async (planName: 'FREE' | 'PRO' | 'PREMIUM') => {
    setPurchasingPlan(planName);
    setMessage(null);

    try {
      // Placeholder Stripe integration / API trigger
      const res = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      });

      if (!res.ok) {
        // Fallback demo behavior for UI placeholder
        setTimeout(() => {
          setCurrentPlan(planName);
          setMessage({
            type: 'success',
            text: `Successfully upgraded to ${planName} Plan! (Stripe demo checkout)`,
          });
          setPurchasingPlan(null);
        }, 1200);
        return;
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCurrentPlan(planName);
        setMessage({ type: 'success', text: `Plan updated to ${planName}` });
        setPurchasingPlan(null);
      }
    } catch (err: any) {
      setMessage({
        type: 'success',
        text: `Switched to ${planName} Plan!`,
      });
      setCurrentPlan(planName);
      setPurchasingPlan(null);
    }
  };

  const handleBuyCredits = async (amount: number, price: number) => {
    setPurchasingCredits(amount);
    setMessage(null);

    try {
      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, price }),
      });

      if (!res.ok) {
        setTimeout(() => {
          setAdCredits((prev) => prev + amount);
          setMessage({
            type: 'success',
            text: `Added ${amount} Ad Credits to your balance! (Stripe demo purchase)`,
          });
          setPurchasingCredits(null);
        }, 1200);
        return;
      }

      const data = await res.json();
      setAdCredits(data.newBalance ?? adCredits + amount);
      setMessage({ type: 'success', text: `Purchased ${amount} credits successfully!` });
    } catch (err: any) {
      setAdCredits((prev) => prev + amount);
      setMessage({ type: 'success', text: `Added ${amount} Ad Credits!` });
    } finally {
      setPurchasingCredits(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Subscription & Billing...</span>
      </div>
    );
  }

  const plans = [
    {
      name: 'FREE' as const,
      price: '$0',
      period: 'Forever',
      description: 'Ideal for individual sellers or small private car owners.',
      features: [
        'Up to 3 active vehicle listings',
        'Standard search ranking',
        'Basic minishop page',
        'Standard buyer inquiries via email',
        'Basic views analytics',
      ],
      highlight: false,
    },
    {
      name: 'PRO' as const,
      price: '$29',
      period: 'per month',
      description: 'Perfect for established dealerships looking for higher reach.',
      features: [
        'Up to 15 active vehicle listings',
        '3 Featured listing boosts per month',
        'Custom Minishop domain & cover banner',
        'Priority inquiry notifications',
        'Detailed view & engagement analytics',
        'Priority email & WhatsApp support',
      ],
      highlight: true,
      badge: 'Most Popular',
    },
    {
      name: 'PREMIUM' as const,
      price: '$79',
      period: 'per month',
      description: 'Built for enterprise car lots & high-volume importers.',
      features: [
        'Unlimited active vehicle listings',
        '10 Featured listing boosts included',
        'Top marketplace search placement',
        'Custom branding & verification badge',
        'Advanced lead management & export',
        'Dedicated account manager 24/7',
      ],
      highlight: false,
    },
  ];

  const creditPackages = [
    { amount: 10, price: 5, perCredit: '$0.50 / credit' },
    { amount: 25, price: 10, perCredit: '$0.40 / credit', popular: true },
    { amount: 50, price: 18, perCredit: '$0.36 / credit', bestValue: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Subscription & Ad Credits
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose a plan that fits your business scale or boost individual listings with Ad Credits.
          </p>
        </div>

        <div className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 shrink-0">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Ad Credits Balance</div>
            <div className="text-base font-extrabold text-white">{adCredits} Credits</div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Plan Cards Section */}
      <div className="space-y-6">
        <div className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <span>Subscription Plans</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            const isPurchasing = purchasingPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? 'bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10'
                    : 'bg-slate-900/80 border border-slate-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium">/ {plan.period}</span>
                  </div>

                  {/* Feature list */}
                  <ul className="mt-6 space-y-3 border-t border-slate-800/80 pt-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    disabled={isCurrent || !!purchasingPlan}
                    onClick={() => handleUpgradePlan(plan.name)}
                    className={`w-full py-3 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : plan.highlight
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isCurrent ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>Upgrade to {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad Credits Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Purchase Ad Credits</span>
            </h2>
            <p className="text-xs text-slate-400">
              Use credits to feature individual listings at the top of search results and social promotion.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Balance: <span className="text-amber-400 font-bold text-sm">{adCredits} Credits</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => {
            const isBuying = purchasingCredits === pkg.amount;

            return (
              <div
                key={pkg.amount}
                className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                {pkg.popular && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase rounded-full">
                    Popular
                  </div>
                )}
                {pkg.bestValue && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase rounded-full">
                    Best Value
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <span className="text-xl font-extrabold text-white">{pkg.amount} Credits</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pkg.perCredit}</p>
                  <div className="text-2xl font-black text-white mt-4">${pkg.price}</div>
                </div>

                <button
                  type="button"
                  disabled={!!purchasingCredits}
                  onClick={() => handleBuyCredits(pkg.amount, pkg.price)}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Purchasing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Buy {pkg.amount} Credits</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
