import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Download, PhoneCall } from 'lucide-react';

export default function Navbar({ onOpenContact, onOpenGetApp }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in-down ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-slate-200' : 'bg-white py-3 border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with User's Exact 3D Metallic ZipGo Brandmark */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/zipgo-logo.png" 
              alt="ZipGo Logistics" 
              className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
            />
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest leading-tight">
                Logistics Pakistan
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                100% EV Electric Fleet
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            
            {/* Solutions Dropdown */}
            <div className="relative" onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                Solutions
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${solutionsOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1 animate-fade-in-down">
                  <a href="#solutions" className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="text-slate-900 font-bold text-xs">Restaurant Delivery</div>
                    <div className="text-[11px] text-slate-500">Fast & hot food delivery</div>
                  </a>
                  <a href="#solutions" className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="text-slate-900 font-bold text-xs">E-commerce Logistics</div>
                    <div className="text-[11px] text-slate-500">Volume-tiered parcel fulfillment</div>
                  </a>
                  <a href="#solutions" className="block px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="text-slate-900 font-bold text-xs">Courier Services</div>
                    <div className="text-[11px] text-slate-500">Nationwide courier accounts</div>
                  </a>
                </div>
              )}
            </div>

            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#why-ev" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Clients</a>
            <a href="#partners" className="hover:text-blue-600 transition-colors">Team</a>

            {/* Resources Dropdown */}
            <div className="relative" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2">
                Resources
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${resourcesOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1 animate-fade-in-down">
                  <a href="#how-it-works" className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-800">Help Center</a>
                  <a href="#how-it-works" className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-800">API Documentation</a>
                  <a href="#pricing" className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-800">Rate Cards</a>
                </div>
              )}
            </div>

            <button onClick={onOpenContact} className="hover:text-blue-600 transition-colors">Contact</button>
          </nav>

          {/* Right CTA Button (Dark Navy Pill Button) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenGetApp}
              className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group hover:scale-[1.03]"
            >
              <span>Get App</span>
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 p-2 rounded-lg bg-slate-100 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 animate-fade-in-down">
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">Solutions</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">Pricing</a>
          <a href="#why-ev" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">About Us</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">Clients</a>
          <a href="#partners" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">Team</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 font-semibold py-2">Resources</a>
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenGetApp(); }}
              className="w-full bg-slate-950 text-white font-bold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-xs"
            >
              <Download className="w-4 h-4" />
              <span>Get App</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
