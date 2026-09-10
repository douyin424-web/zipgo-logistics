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
          
          {/* Col 1: Brand Info with Animated Larger Logo */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur-sm opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className="relative bg-black/60 p-3 rounded-2xl border border-zinc-800">
                  <img 
                    src="/zipgo-logo.png" 
                    alt="ZipGo Logistics Pakistan" 
                    className="h-12 sm:h-14 w-auto object-contain animate-logo-glow"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white tracking-wide uppercase">
                  ZipGo Logistics
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                  100% Green EV Delivery Network
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan's most reliable delivery & logistics platform for restaurants, e-commerce and courier businesses.
            </p>

            {/* Official Social Media Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/company/zipgo-ev-logistics?trk=blended-typeahead" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="ZipGo LinkedIn"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              {/* YouTube */}
              <a 
                href="https://youtube.com/@zipgo.pk56?si=jteYnGn06Lr5TZk_" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="ZipGo YouTube"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <Youtube className="w-4 h-4" />
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@zipgo.pk?_r=1&_t=ZS-99cCCysM9Rp" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="ZipGo TikTok"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-black hover:border-cyan-400 transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/zipgo.pk?stkn=c2Vwcmk5NjFqcDdxa" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="ZipGo Instagram"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:border-pink-500 transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* Facebook */}
              <a 
                href="https://www.facebook.com/profile.php?id=61568027005698&mibextid=rS40aB7S9Ucbxw6va" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="ZipGo Facebook"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <Facebook className="w-4 h-4" />
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
              <li><a href="#why-ev" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#partners" className="hover:text-white transition-colors">Leadership Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
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
        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2025 ZipGo Logistics Pakistan. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#how-it-works" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>

      </div>

    </footer>
  );
}
