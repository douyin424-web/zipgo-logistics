import React from 'react';
import { ShieldCheck, Smartphone, Navigation, DollarSign, Leaf, Headphones, BarChart3, Download } from 'lucide-react';

export default function AppDownload({ onOpenGetApp }) {
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
          
          {/* Left Side: Why Businesses Choose ZipGo (Image 1 Exact 6-Grid Features) */}
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

          {/* Right Side: Download ZipGo App Showcase Card (Image 1 Exact Card) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  Mobile App Experience
                </span>
                <h3 className="text-2xl font-heading font-bold text-slate-900">
                  Download the ZipGo App
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage orders, track deliveries and grow your business on the go. Available for merchants and riders.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={onOpenGetApp}
                  className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-md transition-all text-left"
                >
                  <svg className="w-5 h-5 fill-current text-blue-400" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.43,12.5 19.43,11.5 18.81,10.87L16.81,8.87L14.81,10.87L14.81,13.12L16.81,15.12Z"/>
                  </svg>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">GET IT ON</div>
                    <div className="text-xs font-bold text-white">Google Play</div>
                  </div>
                </button>

                <button 
                  onClick={onOpenGetApp}
                  className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-md transition-all text-left"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">Download on the</div>
                    <div className="text-xs font-bold text-white">App Store</div>
                  </div>
                </button>
              </div>

              {/* 2 Phone Mockups Preview */}
              <div onClick={onOpenGetApp} className="pt-2 cursor-pointer flex gap-3 justify-center">
                <div className="w-32 bg-slate-900 rounded-2xl p-2.5 text-[10px] text-white space-y-2 border border-slate-800 shadow-md">
                  <div className="text-blue-400 font-bold">Orders Overview</div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-slate-400 block">Total Active</span>
                    <span className="text-sm font-bold">12 Orders</span>
                  </div>
                </div>
                <div className="w-32 bg-blue-600 rounded-2xl p-2.5 text-[10px] text-white space-y-2 shadow-md">
                  <div className="font-bold">Live Tracking</div>
                  <div className="bg-blue-700 p-2 rounded-lg">
                    <span className="block text-blue-200">Rider Hassan</span>
                    <span className="text-xs font-bold">ETA 7 mins</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
