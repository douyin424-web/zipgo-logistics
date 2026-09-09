import React, { useState } from 'react';
import { MousePointerClick, UserCheck, Navigation, CheckCircle, ArrowRight, ShieldCheck, MapPin, PackageCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Place Order',
      desc: 'Place your delivery request in seconds via app, web or API.'
    },
    {
      num: '2',
      title: 'We Assign',
      desc: 'Our smart system assigns the best nearby EV rider.'
    },
    {
      num: '3',
      title: 'Pickup',
      desc: 'Rider picks up your order quickly & safely from your store.'
    },
    {
      num: '4',
      title: 'On the Way',
      desc: 'Real-time tracking keeps you and customer updated.'
    },
    {
      num: '5',
      title: 'Delivered',
      desc: 'Order delivered on time, every single time with POD.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (Exact Image 1 text) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            How ZipGo Works
          </h2>
          <p className="text-base font-semibold text-slate-500">
            Simple. Fast. Reliable.
          </p>
        </div>

        {/* 5-Step Connected Flow Diagram (Exact Image 1 diagram) */}
        <div className="relative py-4">
          
          {/* Connector Dashed Line (Desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-slate-300 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Number Badge Circle */}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
                  {step.num}
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-heading font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Dark Dispatch Engine Banner (Image 4 section) */}
        <div className="mt-16 bg-[#06152B] rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              SMART DISPATCH PIPELINE
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              From pickup to proof of delivery
            </h3>
            <p className="text-xs text-slate-400">
              The same dispatch engine runs every order, regardless of segment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-400">01 Order placed</span>
              <p className="text-xs text-slate-300">Manual entry, bulk upload, or direct API call from store.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-400">02 Rider assigned</span>
              <p className="text-xs text-slate-300">Nearest EV rider matched automatically by zone algorithm.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-400">03 Live in transit</span>
              <p className="text-xs text-slate-300">You and your customer track real-time rider GPS coordinates.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-400">04 Delivered & logged</span>
              <p className="text-xs text-slate-300">Digital POD captured and auto-billed at agreed rate card.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
