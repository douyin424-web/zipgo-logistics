import React, { useState } from 'react';
import { Headphones, ShieldCheck, CreditCard, MapPin, Send, CheckCircle2, Facebook, Instagram, Linkedin, Youtube, Download } from 'lucide-react';

export default function Footer({ onOpenContact, onOpenGetApp }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer className="bg-[#030C19] text-white relative overflow-hidden">
      
      {/* Bottom CTA Banner */}
      <div className="bg-[#06152B] py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left pb-10">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Join hundreds of businesses growing with ZipGo.
              </h3>
              <p className="text-xs text-slate-400">
                Tell us your daily volume and we'll quote a custom rate card.
              </p>
            </div>
            
            <button
              onClick={onOpenGetApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center gap-2 shrink-0 hover:scale-105"
            >
              <span>Get App</span>
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Guarantees Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <Headphones className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">24/7 Support</div>
                <div className="text-[10px] text-slate-400">We're always here</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Secure & Safe</div>
                <div className="text-[10px] text-slate-400">Your data & deliveries are safe with us</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Cashless Payments</div>
                <div className="text-[10px] text-slate-400">Multiple secure payment options</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Pan Pakistan Coverage</div>
                <div className="text-[10px] text-slate-400">Delivering in 100+ cities</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info with Logo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/zipgo-logo.png" 
                alt="ZipGo Logistics Pakistan" 
                className="w-10 h-10 object-contain rounded-lg bg-white p-0.5"
              />
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white leading-none">
                  ZIP<span className="text-blue-500">GO</span>
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                  Logistics Pakistan
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan's most reliable delivery & logistics platform for restaurants, e-commerce and courier businesses.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#solutions" className="hover:text-white transition-colors">Restaurant Delivery</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">E-commerce Logistics</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Courier Services</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><button onClick={onOpenContact} className="hover:text-white transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-slate-400">
              Stay updated with ZipGo news & updates.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 text-xs text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed! Thank you.</span>
              </div>
            )}
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          © 2025 ZipGo Logistics Pakistan. All rights reserved.
        </div>

      </div>

    </footer>
  );
}
