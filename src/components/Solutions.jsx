import React, { useState, useEffect } from 'react';
import { Utensils, ShoppingBag, Truck, Check, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function Solutions({ onOpenContact }) {
  const [activeSolution, setActiveSolution] = useState('all'); // 'all', 'restaurant', 'ecommerce', 'courier'
  const [reloadKey, setReloadKey] = useState(0);

  const tiers = [
    {
      key: 'restaurant',
      number: '01',
      tag: 'RESTAURANT',
      title: 'Zone & distance pricing',
      description: "Quick order entry, live rider tracking to the customer's door, and a rate that's transparent by zone.",
      rate: 'Rs 17/km',
      subrate: 'Below in-house petrol cost',
      icon: Utensils,
      popular: false,
      features: [
        'Dedicated hot/cold delivery bags',
        'Direct API integration with POS',
        'Rider arrival within 8 mins',
        'Zero commission on food total'
      ]
    },
    {
      key: 'ecommerce',
      number: '02',
      tag: 'E-COMMERCE',
      title: 'Volume-tiered rates',
      description: 'Bulk order upload or API integration. Rate drops automatically as your confirmed daily volume grows.',
      rate: 'Rs 62–105',
      subrate: 'Per parcel by volume tier',
      icon: ShoppingBag,
      popular: true,
      features: [
        'Bulk CSV & Shopify sync',
        'Same-day & next-day delivery',
        'Cash-on-Delivery (COD) reconciliation',
        'Automated customer SMS tracking'
      ]
    },
    {
      key: 'courier',
      number: '03',
      tag: 'COURIER',
      title: 'Committed-volume accounts',
      description: 'SLA-backed delivery with reporting built for downstream reconciliation and commitment tracking.',
      rate: 'Enterprise Rate',
      subrate: 'Negotiated SLA terms',
      icon: Truck,
      popular: false,
      features: [
        'Dedicated EV fleet allocation',
        'Custom SLA guarantees',
        'Monthly billing & audit trails',
        'Account manager support'
      ]
    }
  ];

  const handleSelectSolution = (key) => {
    setActiveSolution(key);
    setReloadKey((prev) => prev + 1);
    if (key === 'all') {
      window.history.replaceState(null, '', '#solutions');
    } else {
      window.history.replaceState(null, '', `#solution-${key}`);
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('restaurant')) {
        handleSelectSolution('restaurant');
      } else if (hash.includes('ecommerce')) {
        handleSelectSolution('ecommerce');
      } else if (hash.includes('courier')) {
        handleSelectSolution('courier');
      } else if (hash === '#solutions') {
        handleSelectSolution('all');
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail) {
        handleSelectSolution(e.detail);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('zipgo-solution-select', handleCustomEvent);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('zipgo-solution-select', handleCustomEvent);
    };
  }, []);

  return (
    <section id="solutions" className="py-16 bg-white text-slate-900 relative">
      {/* Dedicated Anchors for Direct Navigation */}
      <span id="solution-restaurant" className="absolute -top-24" />
      <span id="solution-ecommerce" className="absolute -top-24" />
      <span id="solution-courier" className="absolute -top-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Delivery Pricing Tiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            One fleet, three ways to sell it
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every client gets the same EV network — priced differently, because a restaurant order and a 1,000-parcel courier account don't cost the same to serve.
          </p>
        </div>

        {/* Category Filter Switcher: Solves Restaurant vs E-Commerce vs Courier Reload */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          <button
            onClick={() => handleSelectSolution('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeSolution === 'all'
                ? 'bg-slate-900 text-white shadow-lg scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Solutions (3)</span>
          </button>

          <button
            onClick={() => handleSelectSolution('restaurant')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeSolution === 'restaurant'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 ring-2 ring-blue-400/40'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Restaurant Delivery</span>
          </button>

          <button
            onClick={() => handleSelectSolution('ecommerce')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeSolution === 'ecommerce'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 ring-2 ring-blue-400/40'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>E-Commerce Logistics</span>
          </button>

          <button
            onClick={() => handleSelectSolution('courier')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeSolution === 'courier'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 ring-2 ring-blue-400/40'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Courier Services</span>
          </button>
        </div>

        {/* 3 Pricing Cards with Reactive Reload Animation */}
        <div 
          key={reloadKey} 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch animate-pop-in"
        >
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = activeSolution === tier.key;
            const isDimmed = activeSolution !== 'all' && !isSelected;

            return (
              <div 
                key={tier.key}
                id={`card-${tier.key}`}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-500 ${
                  isSelected
                    ? 'bg-white border-2 border-blue-600 shadow-2xl scale-105 z-20 ring-4 ring-blue-500/20'
                    : tier.popular && activeSolution === 'all'
                    ? 'bg-white border-2 border-blue-600 shadow-2xl scale-105 z-10' 
                    : isDimmed
                    ? 'bg-slate-50/60 border border-slate-200/80 opacity-75 hover:opacity-100 hover:bg-white hover:border-blue-300'
                    : 'bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Active or Popular Badge */}
                {isSelected ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Selected Solution</span>
                  </div>
                ) : tier.popular && activeSolution === 'all' ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow tracking-wider">
                    Most Popular Choice
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                    <span className="text-xs font-mono font-bold text-blue-600 tracking-wider">
                      {tier.number} — {tier.tag}
                    </span>
                    <div className={`p-3 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white border-slate-200 text-blue-600 shadow-sm'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-heading font-bold text-slate-900 leading-tight">
                      {tier.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[60px]">
                      {tier.description}
                    </p>
                  </div>

                  <div className={`my-6 p-4 rounded-2xl border shadow-sm transition-colors ${
                    isSelected ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-slate-200'
                  }`}>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-blue-600">
                      {tier.rate}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1">
                      {tier.subrate}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={onOpenContact}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected || (tier.popular && activeSolution === 'all')
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02]'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <span>Get Started with {tier.tag}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
