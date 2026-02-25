'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAppStore();
  const userPlan = user?.plan || 'free';

  const handleCheckout = async (plan: 'pro' | 'lifetime') => {
    setIsLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user?.id }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert(error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout');
    } finally {
      setIsLoading(null);
    }
  };

  const isPaidUser = userPlan === 'pro' || userPlan === 'lifetime';

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-12"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Choose your path
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. Your data grows with you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Starter
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Perfect to explore and capture your thoughts.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited clusters
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Audio notes
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Global search, & Reverse-chronology order
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full py-3 text-center border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-8 relative transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white dark:text-zinc-900 mb-2">
              Pro
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-white dark:text-zinc-900">$5</span>
              <span className="text-zinc-400 dark:text-zinc-500">/month</span>
            </div>
            <p className="text-zinc-400 dark:text-zinc-500 mb-6">
              Advanced features for power users.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Starter
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cloud backup
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority sync
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Export data
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
            {userPlan === 'free' ? (
              <button
                onClick={() => handleCheckout('pro')}
                disabled={!!isLoading}
                className="block w-full py-3 text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            ) : userPlan === 'pro' ? (
              <div className="block w-full py-3 text-center bg-green-500 text-white rounded-xl font-medium">
                Current Plan
              </div>
            ) : (
              <button
                onClick={() => handleCheckout('pro')}
                disabled={!!isLoading}
                className="block w-full py-3 text-center border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'pro' ? 'Processing...' : 'Switch to Pro'}
              </button>
            )}
          </div>

          {/* Lifetime */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Lifetime
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">Custom</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              For teams and long-term commitment.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Pro
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                One-time payment
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Dedicated workspace
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom integrations
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Direct support
              </li>
            </ul>
            {userPlan === 'lifetime' ? (
              <div className="block w-full py-3 text-center bg-green-500 text-white rounded-xl font-medium">
                Current Plan
              </div>
            ) : (
              <button
                onClick={() => handleCheckout('lifetime')}
                disabled={!!isLoading || isPaidUser}
                className="block w-full py-3 text-center border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'lifetime' ? 'Processing...' : isPaidUser ? 'Contact for Upgrade' : 'Purchase Lifetime'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Questions? We&apos;re here to help.
          </p>
          <Link
            href="mailto:support@tielog.app"
            className="text-zinc-700 dark:text-zinc-300 font-medium hover:underline"
          >
            Get in touch →
          </Link>
        </div>
      </div>
    </main>
  );
}
