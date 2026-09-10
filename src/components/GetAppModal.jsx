import React, { useState, useEffect } from 'react';
import { X, Smartphone, Bell, CheckCircle2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'zipgo_launch_target_time';
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

export default function GetAppModal({ isOpen, onClose }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Persistent Realtime 10-day countdown
  useEffect(() => {
    let target = localStorage.getItem(STORAGE_KEY);
    if (!target) {
      target = String(Date.now() + TEN_DAYS_MS);
      localStorage.setItem(STORAGE_KEY, target);
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((parseInt(target, 10) - now) / 1000));
      setTimeLeft(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const days = Math.floor(timeLeft / (24 * 3600));
  const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  const timerUnits = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-down overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative my-auto border border-slate-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-900/60 hover:bg-slate-800 transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Dark Launch Header */}
        <div className="bg-[#030C19] pt-8 pb-6 px-4 sm:px-6 text-center space-y-4 relative overflow-hidden">
          {/* Background glowing gradients */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30">
            <Smartphone className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Official Launch Countdown</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
              ZipGo App Going Live
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Real-time synchronization for Pakistan's EV courier network.
            </p>
          </div>

          {/* Realtime Countdown Timer (Fully Responsive 4-Box Grid) */}
          <div className="pt-2 relative z-10">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-sm mx-auto">
              {timerUnits.map((unit, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner group hover:border-blue-500/50 transition-colors"
                >
                  <div className={`text-xl sm:text-3xl font-heading font-black tracking-tight ${
                    idx === 3 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 animate-pulse' 
                      : 'text-white'
                  }`}>
                    {pad(unit.value)}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Early Access Form & App Store Badges */}
        <div className="p-5 sm:p-6 space-y-4 bg-white">
          <p className="text-xs text-slate-600 text-center font-medium">
            Get exclusive early merchant access & discounted launch rates:
          </p>

          {!subscribed ? (
            <form onSubmit={handleNotify} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </button>
              </div>

              {/* Store buttons row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-950 hover:bg-slate-900 transition-colors rounded-xl p-2.5 flex items-center gap-2 border border-slate-800 cursor-pointer">
                  <svg className="w-5 h-5 fill-current text-blue-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.43,12.5 19.43,11.5 18.81,10.87L16.81,8.87L14.81,10.87L14.81,13.12L16.81,15.12Z"/>
                  </svg>
                  <div className="min-w-0">
                    <div className="text-[8px] text-slate-400 uppercase font-semibold leading-none truncate">GET IT ON</div>
                    <div className="text-[11px] font-bold text-white leading-tight truncate">Google Play</div>
                  </div>
                </div>

                <div className="bg-slate-950 hover:bg-slate-900 transition-colors rounded-xl p-2.5 flex items-center gap-2 border border-slate-800 cursor-pointer">
                  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <div className="min-w-0">
                    <div className="text-[8px] text-slate-400 uppercase font-semibold leading-none truncate">Download on</div>
                    <div className="text-[11px] font-bold text-white leading-tight truncate">App Store</div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>You're registered for VIP early access! We'll notify you on launch day.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
