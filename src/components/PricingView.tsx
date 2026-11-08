import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  CreditCard,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const PricingView: React.FC = () => {
  const { user, purchaseCredits, showToast } = useCreative();
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'stripe'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyCredits = async (amount: number, priceStr: string, planName?: string) => {
    setIsProcessing(true);
    await purchaseCredits(amount, selectedProvider, planName);
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-10 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300">
          <span>Official Pricing & Creative Credits</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Fuel Your AI Creations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent subscriptions and credit packs with secure Paystack and Stripe checkout.
        </p>

        {/* Payment Gateway Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setSelectedProvider('paystack')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedProvider === 'paystack'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md'
                : 'bg-[#0D121D] border-[#1C263A] text-slate-400'
            }`}
          >
            Paystack (Africa & Global)
          </button>
          <button
            onClick={() => setSelectedProvider('stripe')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedProvider === 'stripe'
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-md'
                : 'bg-[#0D121D] border-[#1C263A] text-slate-400'
            }`}
          >
            Stripe (Cards & Apple Pay)
          </button>
        </div>
      </div>

      {/* Subscription Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Starter */}
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293D] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Starter</div>
            <div className="text-3xl font-black text-white mb-4">
              $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Explore the creative studio with 100 free starting credits.</p>
            <ul className="space-y-3 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100 AI Generation Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-track Video Timeline Editor</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Microphone Voice Recording</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>720p Video Exports</span>
              </li>
            </ul>
          </div>
          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-[#141B2B] text-xs font-semibold text-slate-400 cursor-default"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Creator */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1C1636] to-[#0D121F] border-2 border-purple-500/60 relative flex flex-col justify-between shadow-xl shadow-purple-950/40">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-[10px] font-extrabold text-white tracking-wider uppercase">
            Recommended
          </div>
          <div>
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Creator Pro</div>
            <div className="text-3xl font-black text-white mb-4">
              $29 <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6">For artists, YouTubers, and commercial content producers.</p>
            <ul className="space-y-3 text-xs text-slate-200 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold text-white">1,000 AI Credits / month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>4K & 1080p 60FPS Video Export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Access to Suno v4, Veo 2, Kling 1.5</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Authorized AI Voice Cloning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Full Commercial License</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleBuyCredits(1000, '$29', 'pro')}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Subscribe via {selectedProvider === 'paystack' ? 'Paystack' : 'Stripe'}</span>
          </button>
        </div>

        {/* Business Studio */}
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293D] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Studio Business</div>
            <div className="text-3xl font-black text-white mb-4">
              $79 <span className="text-xs font-normal text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">For record labels, video agencies, and creative teams.</p>
            <ul className="space-y-3 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">5,000 AI Credits / month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100 GB Cloud Storage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Multi-seat Team Collaboration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Dedicated GPU Priority Queue</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleBuyCredits(5000, '$79', 'business')}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-lg bg-[#141B2B] hover:bg-[#1E293E] text-xs font-bold text-white transition-colors"
          >
            Upgrade to Business
          </button>
        </div>
      </div>

      {/* Credit Top-Up Packs */}
      <div className="pt-8 border-t border-[#182133] space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          Pay-As-You-Go Credit Top-Up Bundles
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { credits: 500, price: '$15', desc: '~40 songs or 20 videos' },
            { credits: 1500, price: '$39', desc: '~120 songs or 75 videos' },
            { credits: 5000, price: '$99', desc: '~400 songs or 250 videos' },
          ].map((pack) => (
            <div
              key={pack.credits}
              className="p-4 rounded-xl bg-[#0D121D] border border-[#1E293F] flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white font-mono">{pack.credits} Credits</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{pack.desc}</div>
              </div>

              <button
                onClick={() => handleBuyCredits(pack.credits, pack.price)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
              >
                Buy {pack.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
