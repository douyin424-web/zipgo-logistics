import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

export default function RateCalculator({ onOpenContact }) {
  const [segment, setSegment] = useState('restaurant'); // restaurant, ecommerce, courier
  const [dailyOrders, setDailyOrders] = useState(50);

  // Math logic
  const costPerOrderPetrol = segment === 'restaurant' ? 150 : segment === 'ecommerce' ? 220 : 280;
  const costPerOrderZipGo = segment === 'restaurant' ? 65 : segment === 'ecommerce' ? 85 : 120;
  
  const monthlyOrders = dailyOrders * 30;
  const monthlyPetrolSpend = monthlyOrders * costPerOrderPetrol;
  const monthlyZipGoSpend = monthlyOrders * costPerOrderZipGo;
  const monthlySavings = monthlyPetrolSpend - monthlyZipGoSpend;

  return (
    <section id="pricing" className="py-20 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-800/60">
              Interactive Rate & Savings Estimator
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
              Calculate Your Monthly Savings
            </h2>
            <p className="text-sm text-slate-300">
              Tell us your daily volume and see how much your business keeps in profit instead of spending on petrol.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controls */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Segment Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Business Category
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setSegment('restaurant')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      segment === 'restaurant' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Restaurant
                  </button>
                  <button
                    onClick={() => setSegment('ecommerce')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      segment === 'ecommerce' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    E-Commerce
                  </button>
                  <button
                    onClick={() => setSegment('courier')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      segment === 'courier' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Courier
                  </button>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-300 font-semibold">Average Daily Deliveries:</span>
                  <span className="text-blue-400 font-mono font-bold text-lg bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    {dailyOrders} orders / day
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={dailyOrders}
                  onChange={(e) => setDailyOrders(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>10 orders</span>
                  <span>250 orders</span>
                  <span>500+ orders</span>
                </div>
              </div>

            </div>

            {/* Result Box */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Estimated Monthly Savings</span>
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-blue-400">
                  PKR {monthlySavings.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-2">/ month</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Petrol Fleet Cost:</span>
                  <span className="font-mono text-red-400">PKR {monthlyPetrolSpend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ZipGo EV Fleet Cost:</span>
                  <span className="font-mono text-blue-400 font-bold">PKR {monthlyZipGoSpend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-900">
                  <span>Estimated Annual Profit Boost:</span>
                  <span className="font-mono text-blue-300">PKR {(monthlySavings * 12).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={onOpenContact}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Request Custom Quote For Your Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
