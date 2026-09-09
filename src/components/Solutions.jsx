import React from 'react';
import { Utensils, ShoppingBag, Truck, Check, ArrowRight, Layers } from 'lucide-react';

export default function Solutions({ onOpenContact }) {
  const tiers = [
    {
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

  return (
    <section id="solutions" className="py-16 bg-white text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
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

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <div 
                key={idx}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  tier.popular 
                    ? 'bg-white border-2 border-blue-600 shadow-2xl scale-105 z-10' 
                    : 'bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-md'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow tracking-wider">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                    <span className="text-xs font-mono font-bold text-blue-600 tracking-wider">
                      {tier.number} — {tier.tag}
                    </span>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-blue-600 shadow-sm">
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

                  <div className="my-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
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
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <span>Get Started</span>
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
