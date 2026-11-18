import React from 'react';
import { ShieldCheck, Navigation, DollarSign, Leaf, Headphones, BarChart3, ArrowRight, Mail } from 'lucide-react';
import { CONTACT_EMAIL } from '../lib/formsubmit';

export default function WhyZipGo({ onOpenContact }) {

  const whyUsFeatures = [
    {
      title: 'Reliable & On-Time',
      desc: 'High on-time delivery rate you can count on',
      icon: ShieldCheck
    },
    {
      title: 'Real-Time Tracking',
      desc: 'Live updates for you & your customers',
      icon: Navigation
    },
    {
      title: 'Affordable Pricing',
      desc: 'Transparent & competitive rates',
      icon: DollarSign
    },
    {
      title: 'EV Fleet',
      desc: 'Eco-friendly EV riders for a greener Pakistan',
      icon: Leaf
    },
    {
      title: 'Dedicated Support',
      desc: '24/7 support to help your business grow',
      icon: Headphones
    },
    {
      title: 'Advanced Dashboard',
      desc: 'Powerful analytics & reports at your fingertips',
      icon: BarChart3
    }
  ];

  return (
    <section className="py-24 bg-slate-50 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Why Businesses Choose ZipGo (6-Grid Features) */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
                Why Businesses Choose ZipGo
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Built specifically for Pakistan's top restaurants, e-commerce brands, and couriers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyUsFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-blue-500 transition-colors">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-heading font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Quote Request Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  Get Started
                </span>
                <h3 className="text-2xl font-heading font-bold text-slate-900">
                  Get a Rate Card for Your Business
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tell us your business type and daily volume, and our team will send you a tailored quote.
                </p>
              </div>

              <button
                onClick={onOpenContact}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.02]"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{CONTACT_EMAIL}</span>
              </a>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
