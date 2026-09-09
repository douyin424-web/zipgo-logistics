import React, { useState, useEffect } from 'react';
import { X, Smartphone, Bell, CheckCircle2, Download } from 'lucide-react';

// 10 Days in seconds
const TEN_DAYS_SECONDS = 10 * 24 * 60 * 60;

export default function GetAppModal({ isOpen, onClose }) {
  const [timeLeft, setTimeLeft] = useState(TEN_DAYS_SECONDS);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const days    = Math.floor(timeLeft / (24 * 3600));
  const hours   = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Dark Banner */}
        <div className="bg-slate-950 pt-8 pb-6 px-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Official Launch Countdown</span>
            <h3 className="text-xl font-heading font-black text-white mt-1">
              ZipGo App Coming Soon!
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Available on Google Play & App Store in:
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex items-stretch justify-center gap-2 pt-2">
            {[
              { value: days,    label: 'Days' },
              { value: hours,   label: 'Hrs' },
              { value: minutes, label: 'Min' },
              { value: seconds, label: 'Sec' },
            ].map((unit, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <span className={`text-2xl font-heading font-black ${
                      idx === 3 ? 'text-blue-400 animate-pulse' : 'text-white'
                    }`}>
                      {pad(unit.value)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">{unit.label}</span>
                </div>
                {idx < 3 && (
                  <div className="flex items-center pb-5">
                    <span className="text-xl font-bold text-slate-600 leading-none">:</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom White Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Register for VIP early access — get notified the moment the app goes live!
          </p>

          {!subscribed ? (
            <form onSubmit={handleNotify} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition-all text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify</span>
                </button>
              </div>

              {/* Store buttons row */}
              <div className="flex gap-2 pt-1">
                <div className="flex-1 bg-slate-900 rounded-xl px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current text-blue-400" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.43,12.5 19.43,11.5 18.81,10.87L16.81,8.87L14.81,10.87L14.81,13.12L16.81,15.12Z"/>
                  </svg>
                  <div>
                    <div className="text-[8px] text-slate-400 uppercase leading-none">GET IT ON</div>
                    <div className="text-[11px] font-bold text-white leading-tight">Google Play</div>
                  </div>
                </div>
                <div className="flex-1 bg-slate-900 rounded-xl px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  <div>
                    <div className="text-[8px] text-slate-400 uppercase leading-none">DOWNLOAD ON</div>
                    <div className="text-[11px] font-bold text-white leading-tight">App Store</div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>You're registered for early access! We'll notify you on launch day.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
