import React, { useState } from 'react';
import { ShoppingBag, UserCheck, Bike, Navigation, PackageCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '1',
      title: 'Place Order',
      desc: 'Place your delivery request in seconds via app, web dashboard or direct POS API.',
      icon: ShoppingBag,
      accent: 'from-blue-500 to-cyan-400'
    },
    {
      num: '2',
      title: 'We Assign',
      desc: 'Our AI smart-dispatch algorithm matches the nearest salaried EV rider within seconds.',
      icon: UserCheck,
      accent: 'from-cyan-500 to-teal-400'
    },
    {
      num: '3',
      title: 'Pickup',
      desc: 'Dedicated rider arrives at your store/warehouse with insulated hot/cold delivery bags.',
      icon: Bike,
      accent: 'from-emerald-500 to-teal-400'
    },
    {
      num: '4',
      title: 'On the Way',
      desc: 'Real-time live GPS telemetry keeps you and your end-customer constantly updated.',
      icon: Navigation,
      accent: 'from-indigo-500 to-blue-400'
    },
    {
      num: '5',
      title: 'Delivered',
      desc: 'Instant digital Proof of Delivery (POD) & automated COD settlement reconciliation.',
      icon: PackageCheck,
      accent: 'from-emerald-500 to-cyan-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white text-slate-900 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workflow Automation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tight">
            How ZipGo Works
          </h2>
          <p className="text-sm sm:text-base font-medium text-slate-500 max-w-xl mx-auto">
            Simple. Fast. Reliable. Seamless delivery orchestration engineered for scale.
          </p>
        </div>

        {/* 5-Step Connected Interactive Flow Diagram */}
        <div className="relative py-6">
          
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[62px] left-[8%] right-[8%] h-1 bg-slate-100 z-0">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-emerald-400 to-cyan-500 transition-all duration-700 rounded-full"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <div 
                  key={idx}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`bg-white rounded-3xl p-6 text-center space-y-4 transition-all duration-500 cursor-pointer border relative group ${
                    isActive 
                      ? 'border-blue-600 shadow-2xl scale-105 -translate-y-2' 
                      : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300'
                  }`}
                >
                  {/* Step Number Badge Circle with Ripple Effect */}
                  <div className="relative mx-auto w-14 h-14">
                    {isActive && (
                      <span className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-40" />
                    )}
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-lg transition-transform duration-500 shadow-md ${
                      isActive 
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/30 scale-110' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Tiny Step Number Pill */}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] font-bold flex items-center justify-center border border-white shadow">
                      {step.num}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-base font-heading font-black transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
                      {step.desc}
                    </p>
                  </div>

                  {/* Active Indicator Bar */}
                  <div className={`w-8 h-1 mx-auto rounded-full transition-all duration-300 ${
                    isActive ? 'bg-blue-600 w-12' : 'bg-transparent'
                  }`} />
                </div>
              );
            })}
          </div>

        </div>

        {/* Dark Dispatch Engine Banner with Hover Interactive Cards */}
        <div className="mt-16 bg-[#030C19] rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-slate-900/90 px-3.5 py-1 rounded-full border border-slate-800">
              SMART DISPATCH PIPELINE
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              From pickup to proof of delivery
            </h3>
            <p className="text-xs text-slate-400">
              The same proprietary dispatch engine orchestrates every order seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {[
              { num: '01', title: 'Order Placed', desc: 'Manual entry, bulk CSV upload, or direct API webhook call from store.' },
              { num: '02', title: 'Rider Assigned', desc: 'Nearest EV rider matched in under 8 seconds by zone-demand algorithm.' },
              { num: '03', title: 'Live in Transit', desc: 'You and your customer track real-time sub-second GPS coordinates.' },
              { num: '04', title: 'Delivered & Logged', desc: 'Digital OTP/POD captured and auto-reconciled with daily statements.' },
            ].map((card, cIdx) => (
              <div 
                key={cIdx} 
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-blue-500/60 hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">{card.num}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{card.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
