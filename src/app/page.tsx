"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NeuronBackground from "@/components/NeuronBackground";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [emojis, setEmojis] = useState<{ id: number, top: string, left: string, speedX: number, speedY: number, rotation: number }[]>([]);
  const [flickerWord, setFlickerWord] = useState("thoughts");
  const [isFlickering, setIsFlickering] = useState(false);

  // Pre-generated static positions to avoid hydration mismatch
  // Spread across 200% of viewport height to cover hero through pricing
  const newEmojis = useMemo(() => {
    // Use a simple seeded-like generator for deterministic values
    const seeded = (i: number) => {
      const x = Math.sin(i * 9999) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.floor(seeded(i) * 500) - 50}%`,
      left: `${Math.floor(seeded(i + 100) * 100)}%`,
      speedX: (seeded(i + 200) - 0.5) * 8,
      speedY: (seeded(i + 300) - 0.5) * 8,
      rotation: Math.floor(seeded(i + 400) * 360),
    }));
  }, []);

  useEffect(() => {
    setEmojis(newEmojis);
  }, [newEmojis]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlickering(true);
      setTimeout(() => {
        setFlickerWord((prev) => (prev === "thoughts" ? "observations" : "thoughts"));
        setIsFlickering(false);
      }, 500); // Smoother fade duration
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: 'pro' | 'lifetime') => {
    setIsLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    setMousePos({ x, y });
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0F] text-[#F4F4F5] selection:bg-[#14B8A6]/30 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <NeuronBackground />
      {/* Interactive Background Emojis - Wraps entire canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute text-sm md:text-base opacity-25 transition-transform duration-300 ease-out"
            style={{
              top: emoji.top,
              left: emoji.left,
              transform: `translate(${mousePos.x * emoji.speedX}px, ${mousePos.y * emoji.speedY}px) rotate(${emoji.rotation}deg)`,
            }}
          >
            💭
          </div>
        ))}
        {/* Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#14B8A6]/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* Navigation - HeyMessage Inspired */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 z-10">
            <img src="/logo.jpg" alt="TieLog Logo" className="w-8 h-8 rounded-lg object-cover shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
            <span className="text-xl font-semibold tracking-tight">TieLog</span>
          </div>

          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8 bg-[#1C1C24]/80 px-8 py-3 rounded-full border border-[#2A2A35] backdrop-blur-md">
            <a href="#features" className="text-sm font-medium text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors">Features</a>
            <a href="#why-us" className="text-sm font-medium text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors">Why Us</a>
            <a href="#pricing" className="text-sm font-medium text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4 z-10">
            <Link href="/auth/signin" className="text-sm font-medium text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors">
              Log in
            </Link>
            <Link href="/auth/signup" className="text-sm px-4 py-2 bg-[#14B8A6] text-[#0A0A0F] font-semibold rounded-full hover:bg-[#2DD4BF] transition-colors shadow-[0_0_10px_rgba(20,184,166,0.2)]">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh] z-10 pointer-events-none"
      >
        <div className="relative max-w-4xl mx-auto text-center pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6] text-sm mb-8 backdrop-blur-sm animate-flicker">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            It&apos;s a Journal. Not a Database
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-tight">
            Remember the details
            <br />
            <span className="text-[#14B8A6] font-normal">about everyone you meet.</span>
          </h1>

          <p className="text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
            Meet people frequently? Log your ties with no CRM, data entry hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth/signup"
              className="px-8 py-4 bg-[#F4F4F5] text-[#0A0A0F] font-semibold rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Start Your Logbook
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 bg-transparent border border-[#2A2A35] text-[#F4F4F5] font-semibold rounded-full hover:bg-[#1C1C24] transition-colors backdrop-blur-sm"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features Outline */}
      <section id="features" className="relative py-24 px-6 border-t border-[#1C1C24] bg-transparent backdrop-blur-[2px] z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#A1A1AA] text-lg max-w-2xl mx-auto flex items-center justify-center gap-1.5 flex-wrap mb-10">
              Built for{" "}
              <span className="relative inline-flex flex-col items-center mx-2">
                {/* Rotating Shooting Star */}
                <div className="absolute inset-0 -m-6 pointer-events-none animate-[spin_3s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff,0_0_20px_#14B8A6] animate-pulse"></div>
                </div>

                <span className="absolute -top-7 text-sm text-[#14B8A6] font-black uppercase tracking-widest leading-none drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]">
                  CONTEXT
                </span>
                <span className="line-through opacity-30 text-xl">Contact</span>
              </span>{" "}
              Management
            </div>

            <h2 className="text-3xl md:text-6xl font-light mb-6 min-h-[1.2em] transition-all duration-700">
              Your{" "}
              <span
                className={`transition-all duration-500 inline-block ${isFlickering ? 'opacity-0 translate-y-2 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}
                style={{ color: '#14B8A6', fontWeight: 400 }}
              >
                {flickerWord}
              </span>{" "}
              by your side.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#141419] border border-[#2A2A35] hover:border-[#14B8A6]/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Audio Notes</h3>
              <p className="text-[#A1A1AA] leading-relaxed">
                Tap, speak, save. Capture the tone, the exact quote, and the nuance that text simply can&apos;t convey.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#141419] border border-[#2A2A35] hover:border-[#14B8A6]/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Total Privacy</h3>
              <p className="text-[#A1A1AA] leading-relaxed">
                Your notes are encrypted before they ever leave your device. Row Level Security ensures your data is only yours.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#141419] border border-[#2A2A35] hover:border-[#14B8A6]/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Offline-First</h3>
              <p className="text-[#A1A1AA] leading-relaxed">
                No signal? No problem. Every feature works perfectly offline and silently syncs when you&apos;re back online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us - Comparison Section */}
      <section id="why-us" className="relative py-24 px-6 border-t border-[#1C1C24] bg-transparent backdrop-blur-[2px] z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light mb-6">
              Why choose TieLog?
            </h2>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              See how we stack up against the competition. No bloated features—just what you need.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  <th className="py-4 px-4 text-[#A1A1AA] font-medium">Feature</th>
                  <th className="py-4 px-4 text-[#14B8A6] font-semibold text-center bg-[#14B8A6]/5 rounded-t-lg">TieLog</th>
                  <th className="py-4 px-4 text-[#A1A1AA] font-medium text-center">Notion</th>
                  <th className="py-4 px-4 text-[#A1A1AA] font-medium text-center">Obsidian</th>
                  <th className="py-4 px-4 text-[#A1A1AA] font-medium text-center">Day One</th>
                  <th className="py-4 px-4 text-[#A1A1AA] font-medium text-center">Evernote</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#2A2A35]/50 hover:bg-[#1C1C24]/30 transition-colors">
                  <td className="py-4 px-4 text-[#F4F4F5] font-medium">Offline Mode</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6] font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>100%</span></td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span></td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span></td>
                  <td className="py-4 px-4 text-center text-[#A1A1AA] text-sm">Limited</td>
                </tr>
                <tr className="border-b border-[#2A2A35]/50 hover:bg-[#1C1C24]/30 transition-colors">
                  <td className="py-4 px-4 text-[#F4F4F5] font-medium">E2E Encryption</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6] font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Built-in</span></td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#A1A1AA] text-sm">Plugin</td>
                  <td className="py-4 px-4 text-center text-[#A1A1AA] text-sm">Paid</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                </tr>
                <tr className="border-b border-[#2A2A35]/50 hover:bg-[#1C1C24]/30 transition-colors">
                  <td className="py-4 px-4 text-[#F4F4F5] font-medium">Audio Recording</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6] font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Built-in</span></td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span></td>
                  <td className="py-4 px-4 text-center text-[#A1A1AA] text-sm">Premium</td>
                </tr>
                <tr className="border-b border-[#2A2A35]/50 hover:bg-[#1C1C24]/30 transition-colors">
                  <td className="py-4 px-4 text-[#F4F4F5] font-medium">People/CRM</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6] font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Hierarchy</span></td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                </tr>
                <tr className="border-b border-[#2A2A35]/50 hover:bg-[#1C1C24]/30 transition-colors">
                  <td className="py-4 px-4 text-[#F4F4F5] font-medium">Pre-built Structure</td>
                  <td className="py-4 px-4 text-center"><span className="inline-flex items-center gap-1.5 text-[#14B8A6] font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span></td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                  <td className="py-4 px-4 text-center text-[#71717A]">—</td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#141419] border border-[#2A2A35]">
              <h3 className="text-lg font-semibold text-[#F4F4F5] mb-3">⚡ Lightning Fast</h3>
              <p className="text-[#A1A1AA] text-sm">From open to note saved in under 10 seconds.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#141419] border border-[#2A2A35]">
              <h3 className="text-lg font-semibold text-[#F4F4F5] mb-3">🔒 Zero-Knowledge Privacy</h3>
              <p className="text-[#A1A1AA] text-sm">Client-side E2E encryption.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#141419] border border-[#2A2A35]">
              <h3 className="text-lg font-semibold text-[#F4F4F5] mb-3">👥 People-First Design</h3>
              <p className="text-[#A1A1AA] text-sm">Built-in hierarchy Cluster → Org → Person</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-6 bg-transparent z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-[#F4F4F5] mb-6">
              Choose your path
            </h2>
            <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto">
              Start for free, upgrade when your network grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-[#141419] border border-[#2A2A35] rounded-3xl p-8 hover:border-[#14B8A6]/30 transition-all flex flex-col">
              <h3 className="text-xl font-semibold text-[#F4F4F5] mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-light tracking-tight text-[#F4F4F5]">$0</span>
                <span className="text-[#71717A]">/mo</span>
              </div>
              <p className="text-[#A1A1AA] mb-8 text-sm">Perfect to explore and capture your first thoughts.</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Unlimited clusters & notes
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Core Audio notes
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Global search, & Reverse-chronology order
                </li>
              </ul>
              <a href="/auth/signup" className="block w-full py-3.5 text-center border border-[#2A2A35] text-[#F4F4F5] rounded-full font-medium hover:bg-[#1C1C24] transition-colors">
                Start for Free
              </a>
            </div>

            {/* Pro */}
            <div className="bg-[#1C1C24] border border-[#14B8A6]/40 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(20,184,166,0.1)] flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#14B8A6] text-[#0A0A0F] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-[#F4F4F5] mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-light tracking-tight text-[#14B8A6]">$5</span>
                <span className="text-[#71717A]">/mo</span>
              </div>
              <p className="text-[#A1A1AA] mb-8 text-sm">Advanced features for power networkers.</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Everything in Starter
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Secure Cloud backup
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Priority sync queues
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Export & Data ownership
                </li>
              </ul>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={!!isLoading}
                className="block w-full py-3.5 text-center bg-[#F4F4F5] text-[#0A0A0F] rounded-full font-semibold hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'pro' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-[#0A0A0F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-[#141419] border border-[#2A2A35] rounded-3xl p-8 hover:border-[#14B8A6]/30 transition-all flex flex-col">
              <h3 className="text-xl font-semibold text-[#F4F4F5] mb-2">Lifetime</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-light tracking-tight text-[#F4F4F5]">Custom</span>
              </div>
              <p className="text-[#A1A1AA] mb-8 text-sm">For teams and long-term commitments.</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> One-time payment
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Dedicated workspace
                </li>
                <li className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                  <span className="text-[#14B8A6]">✓</span> Premium SLA support
                </li>
              </ul>
              <button
                onClick={() => handleCheckout('lifetime')}
                disabled={!!isLoading}
                className="block w-full py-3.5 text-center border border-[#2A2A35] text-[#F4F4F5] rounded-full font-medium hover:bg-[#1C1C24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading === 'lifetime' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-[#F4F4F5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Purchase Lifetime'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 px-6 border-t border-[#2A2A35] z-10 bg-[#0A0A0F]/90">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="TieLog Logo" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-[#71717A]">TieLog</span>
          </div>
          <p className="text-[#71717A] text-sm">
            Your memories. Your notes. Your business.
          </p>
        </div>
      </footer>
    </div>
  );
}
