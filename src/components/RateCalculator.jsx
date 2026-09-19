import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, DollarSign, TrendingUp, CheckCircle, FileText, Sparkles, Shield, Clock, Zap } from 'lucide-react';

export default function RateCalculator({ onOpenContact }) {
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' or 'rate-cards'
  const [segment, setSegment] = useState('restaurant'); // restaurant, ecommerce, courier
  const [dailyOrders, setDailyOrders] = useState(50);

  // Sync tab with URL hash if navigated directly
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#rate-cards') {
        setActiveTab('rate-cards');
      } else if (hash === '#pricing') {
        setActiveTab('pricing');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Math logic
  const costPerOrderPetrol = segment === 'restaurant' ? 150 : segment === 'ecommerce' ? 220 : 280;
  const costPerOrderZipGo = segment === 'restaurant' ? 65 : segment === 'ecommerce' ? 85 : 120;
  
  const monthlyOrders = dailyOrders * 30;
  const monthlyPetrolSpend = monthlyOrders * costPerOrderPetrol;
  const monthlyZipGoSpend = monthlyOrders * costPerOrderZipGo;
  const monthlySavings = monthlyPetrolSpend - monthlyZipGoSpend;

  const rateCards = [
    {
      title: "Restaurant Delivery",
      badge: "Food & Beverage",
      price: "Rs 65",
      unit: "/ delivery",
      popular: true,
      features: [
        "Under 4-minute rider dispatch",
        "Dedicated zone-assigned EV fleet",
        "Insulated thermal & spill-proof box",
        "Live real-time GPS tracking link",
        "Zero petrol price surge charges",
        "Direct rider-to-store communication"
      ]
    },
    {
      title: "E-Commerce Fulfillment",
      badge: "Brands & Retailers",
      price: "Rs 85",
      unit: "/ parcel",
      popular: false,
      features: [
        "Same-day & scheduled next-day delivery",
        "24-Hour digital COD remittance",
        "Automated WhatsApp & SMS updates",
        "Seamless return & exchange handling",
        "Real-time merchant web portal & API",
        "Proof of delivery with digital signatures"
      ]
    },
    {
      title: "Corporate & Express Courier",
      badge: "Enterprises & Offices",
      price: "Rs 120",
      unit: "/ shipment",
      popular: false,
      features: [
        "Intra-city priority point-to-point",
        "Secure document & parcel transit",
        "Dual verification (OTP + Signature)",
        "Monthly consolidated GST invoicing",
        "Dedicated enterprise account manager",
        "Bulk volume custom discounts"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-950 text-white border-t border-slate-800 relative">
      {/* Target anchor for Rate Cards */}
      <span id="rate-cards" className="absolute -top-24" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tab Switcher: Solves Pricing vs Rate Card confusion */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <button
              onClick={() => {
                setActiveTab('pricing');
                window.history.replaceState(null, '', '#pricing');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Pricing Calculator</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('rate-cards');
                window.history.replaceState(null, '', '#rate-cards');
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'rate-cards'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Official Rate Cards</span>
            </button>
          </div>
        </div>

        {activeTab === 'pricing' ? (
          /* TAB 1: INTERACTIVE PRICING & SAVINGS CALCULATOR */
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-pop-in">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-800/60 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Rate & Savings Estimator</span>
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
        ) : (
          /* TAB 2: OFFICIAL RATE CARDS */
          <div className="space-y-8 animate-pop-in">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3 py-1 rounded-full border border-blue-800/60 inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Transparent Commercial Pricing</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                Official ZipGo Rate Cards
              </h2>
              <p className="text-sm text-slate-300">
                Predictable, volume-based delivery rates with zero hidden fuel charges or surge pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rateCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                    card.popular
                      ? 'bg-gradient-to-b from-blue-950/60 to-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20'
                      : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {card.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/50 inline-block mb-3">
                        {card.badge}
                      </span>
                      <h3 className="text-xl font-heading font-bold text-white">{card.title}</h3>
                    </div>

                    <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-800">
                      <span className="text-4xl font-heading font-black text-white">{card.price}</span>
                      <span className="text-xs font-medium text-slate-400">{card.unit}</span>
                    </div>

                    <ul className="space-y-3">
                      {card.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800">
                    <button
                      onClick={onOpenContact}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        card.popular
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Choose {card.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
