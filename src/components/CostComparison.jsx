import React, { useState } from 'react';
import { Calculator, Zap, Flame, ArrowRight } from 'lucide-react';

export default function CostComparison({ onOpenContact }) {
  const [distance, setDistance] = useState(15);

  const petrolCost = distance * 18;
  const evCost = distance * 1.75;
  const savings = petrolCost - evCost;
  const percentageSaved = Math.round(((petrolCost - evCost) / petrolCost) * 100);

  return (
    <section id="about-us" className="py-24 bg-slate-50 text-slate-900 border-t border-slate-200 relative">
      {/* Anchor for backward compatibility */}
      <span id="why-ev" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Math Comparison */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">COST PER KILOMETER ANALYSIS</h3>
                  <p className="text-xs text-slate-600 font-medium">Actual Lahore Operational Fleet Comparison</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  90%+ Cost Cut
                </span>
              </div>

              {/* Bar Comparison 1: Petrol */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500" />
                    In-House Petrol Fleet
                  </span>
                  <span className="font-mono font-bold text-red-600 text-sm">Rs 18.00 / km</span>
                </div>
                <div className="h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                  <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full w-full flex items-center justify-end pr-3">
                    <span className="text-[10px] font-bold text-white uppercase">Expensive Petrol + Maintenance</span>
                  </div>
                </div>
              </div>

              {/* Bar Comparison 2: ZipGo EV */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-blue-600 font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 fill-blue-600" />
                    ZipGo Electric Fleet
                  </span>
                  <span className="font-mono font-bold text-blue-600 text-base">Rs 1.50 – 2.00 / km</span>
                </div>
                <div className="h-7 bg-slate-100 rounded-full overflow-hidden p-1 border border-blue-200">
                  <div className="h-full bg-blue-600 rounded-full w-[12%] flex items-center justify-end pr-2 shadow">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Savings Calculation */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">Simulate delivery trip:</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-mono">
                    {distance} km trip
                  </span>
                </div>
                
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600 font-medium">Savings Per Trip</div>
                    <div className="text-2xl font-heading font-extrabold text-blue-600">
                      Rs {savings.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {percentageSaved}% Cheaper
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Direct profit margin increase</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Copy & Value Pillars */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase border border-blue-100 inline-block">
                About ZipGo • Commercial Fleet
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-900 tracking-tight leading-tight">
                Pakistan's First Electric Delivery Fleet for Restaurants & Ecommerce
              </h2>
              <div className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">
                The math is the pitch — 90%+ Cost Cut
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                ZipGo operates Pakistan's premier <strong>electric delivery fleet in Lahore</strong>. Our commercial <strong>EV delivery service in Pakistan</strong> cuts per-kilometer fuel expenses by over 90% while ensuring 100% salaried riders, digital live tracking, and guaranteed on-time delivery for high-volume brands.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0 border border-blue-100">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">Fleet we own, not a marketplace</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Salaried, zone-assigned riders — not gig workers picking up whichever order pays more that hour.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0 border border-blue-100">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">Live tracking, not WhatsApp updates</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Most operations at our size still coordinate manually. Every ZipGo order is tracked digitally end-to-end.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0 border border-blue-100">
                  03
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">Your brand stays yours</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We deliver on your behalf — your customer relationship never routes through us.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenContact}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all text-xs flex items-center gap-2"
            >
              <span>Calculate Fleet Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
