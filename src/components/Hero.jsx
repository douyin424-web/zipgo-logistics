import React from 'react';
import { Download, Play, Cpu, Eye, BarChart3, MapPin } from 'lucide-react';

export default function Hero({ onOpenContact, onOpenGetApp }) {
  return (
    <section className="relative pt-20 sm:pt-24 bg-white text-slate-900 overflow-hidden">
      
      {/* ===== MAIN HERO AREA ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          {/* ===== LEFT TEXT CONTENT ===== */}
          <div className="lg:col-span-6 pt-6 sm:pt-10 pb-4 sm:pb-8 space-y-5 sm:space-y-6 z-10 relative animate-fade-in-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 animate-fade-in-down delay-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>#1 Delivery Platform in Pakistan</span>
            </div>

            {/* Main Headline (Single H1 for strict Google SEO compliance) */}
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-slate-900 leading-tight">
              A Delivery Partner <br className="hidden sm:inline" />
              You Can <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">Rely On</span>
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              Technology, transparency and trust at the core of every delivery we make.
            </p>

            {/* 3 Feature Bullets */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Smart Dispatch</h4>
                  <p className="text-[11px] text-slate-500">AI-powered order allocation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live Visibility</h4>
                  <p className="text-[11px] text-slate-500">Real-time tracking for you & your customers</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Performance Analytics</h4>
                  <p className="text-[11px] text-slate-500">Data-driven insights for your business</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
              <button
                onClick={onOpenGetApp}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm group hover:scale-[1.02]"
              >
                <span>Get App</span>
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href="#how-it-works"
                className="bg-white text-slate-700 hover:text-slate-900 font-semibold px-6 py-3 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 text-sm hover:border-slate-400 shadow-sm hover:scale-[1.02]"
              >
                <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-slate-700 text-slate-700 ml-0.5" />
                </div>
                <span>See How It Works</span>
              </a>
            </div>
          </div>

          {/* ===== RIGHT: REALISTIC HERO IMAGE + FLOATING PERFORMANCE CARD ===== */}
          <div className="lg:col-span-6 relative pb-10 sm:pb-6 lg:pb-0 flex flex-col items-center animate-fade-in-right">
            
            {/* Image Container */}
            <div className="relative w-full max-w-[520px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 group">
              <img 
                src="/hero-rider.jpg" 
                alt="ZipGo Electric Delivery Rider" 
                className="w-full h-[320px] sm:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-950/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Salaried EV Fleet</span>
              </div>
            </div>

            {/* Floating "Today's Performance" Card - Fixed mobile positioning */}
            <div className="relative -mt-10 sm:mt-0 sm:absolute sm:-bottom-4 sm:right-0 z-20 w-[92%] sm:w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xl space-y-2.5 sm:space-y-3 animate-float">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Today's Performance</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Wednesday, 21 May 2025</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Delivered</span>
                  <span className="text-base sm:text-lg font-heading font-extrabold text-slate-900 block leading-tight">248</span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">On-Time</span>
                  <span className="text-base sm:text-lg font-heading font-extrabold text-blue-600 block leading-tight">97.6%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Earnings</span>
                  <span className="text-xs sm:text-sm font-heading font-extrabold text-slate-900 block leading-tight mt-0.5">PKR 48,760</span>
                </div>
              </div>

              <button
                onClick={onOpenContact}
                className="text-[11px] sm:text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 w-full justify-center sm:justify-start"
              >
                <span>View Full Report</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ===== DARK NAVY SERVICE RIBBON ===== */}
      <div className="bg-[#030C19] mt-8 animate-fade-in-up delay-200 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800 py-6">
            
            <div className="flex items-center gap-4 md:pr-8 pb-4 md:pb-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Restaurant Delivery</h3>
                <p className="text-xs text-slate-400">Fast & hot food delivery to your customers</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:px-8 py-4 md:py-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">E-commerce Logistics</h3>
                <p className="text-xs text-slate-400">Scale your business with reliable deliveries</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:pl-8 pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Courier Services</h3>
                <p className="text-xs text-slate-400">Document & parcel delivery across Pakistan</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
