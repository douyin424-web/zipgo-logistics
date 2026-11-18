import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, PhoneCall, Store, Bike } from 'lucide-react';
import { Link } from '../portal/router';

export default function Navbar({ onOpenContact }) {
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hover devices open on hover (click keeps it open); touch devices toggle on tap
  const toggleDropdown = (setOpen) => {
    const canHover = window.matchMedia('(hover: hover)').matches;
    setOpen((open) => (canHover ? true : !open));
  };

  const handleSolutionClick = (key) => {
    setSolutionsOpen(false);
    setMobileMenuOpen(false);
    window.location.hash = `#solution-${key}`;
    window.dispatchEvent(new CustomEvent('zipgo-solution-select', { detail: key }));
    const el = document.getElementById('solutions');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleRateCardsClick = () => {
    setResourcesOpen(false);
    setMobileMenuOpen(false);
    window.location.hash = '#rate-cards';
    const el = document.getElementById('rate-cards') || document.getElementById('pricing');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in-down ${
      isScrolled ? 'bg-black/95 backdrop-blur-md shadow-xl py-3 border-b border-zinc-800' : 'bg-black py-4 border-b border-zinc-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Developer Spec: Soft Blue/Cyan Light Sweep Animation */}
          <a href="#" className="flex items-center group py-0.5">
            <div className="logo-light-sweep-container">
              <img 
                src="/zipgo-logo.png" 
                alt="ZipGo Logistics" 
                className="h-11 sm:h-12 md:h-14 w-auto max-w-[170px] sm:max-w-[210px] object-contain"
              />
              {/* Soft electric blue/cyan light sweep beam */}
              <div className="logo-light-sweep-beam" />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
            
            {/* Solutions Dropdown */}
            <div className="relative" onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
              <button
                type="button"
                onClick={() => toggleDropdown(setSolutionsOpen)}
                aria-haspopup="true"
                aria-expanded={solutionsOpen}
                className="flex items-center gap-1 hover:text-white transition-colors py-2"
              >
                Solutions
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${solutionsOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 space-y-1 animate-fade-in-down">
                  <a 
                    href="#solution-restaurant" 
                    onClick={(e) => { e.preventDefault(); handleSolutionClick('restaurant'); }}
                    className="block px-3 py-2 rounded-xl hover:bg-zinc-900 transition-colors group"
                  >
                    <div className="text-white group-hover:text-blue-400 font-bold text-xs flex items-center justify-between">
                      <span>Restaurant Delivery</span>
                      <span className="text-[10px] font-mono text-blue-400">01</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Fast & hot food delivery</div>
                  </a>
                  <a 
                    href="#solution-ecommerce" 
                    onClick={(e) => { e.preventDefault(); handleSolutionClick('ecommerce'); }}
                    className="block px-3 py-2 rounded-xl hover:bg-zinc-900 transition-colors group"
                  >
                    <div className="text-white group-hover:text-blue-400 font-bold text-xs flex items-center justify-between">
                      <span>E-commerce Logistics</span>
                      <span className="text-[10px] font-mono text-blue-400">02</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Volume-tiered parcel fulfillment</div>
                  </a>
                  <a 
                    href="#solution-courier" 
                    onClick={(e) => { e.preventDefault(); handleSolutionClick('courier'); }}
                    className="block px-3 py-2 rounded-xl hover:bg-zinc-900 transition-colors group"
                  >
                    <div className="text-white group-hover:text-blue-400 font-bold text-xs flex items-center justify-between">
                      <span>Courier Services</span>
                      <span className="text-[10px] font-mono text-blue-400">03</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Nationwide courier accounts</div>
                  </a>
                </div>
              )}
            </div>

            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#about-us" className="hover:text-white transition-colors">About Us</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Clients</a>
            <a href="#partners" className="hover:text-white transition-colors">Team</a>

            {/* Resources Dropdown */}
            <div className="relative" onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
              <button
                type="button"
                onClick={() => toggleDropdown(setResourcesOpen)}
                aria-haspopup="true"
                aria-expanded={resourcesOpen}
                className="flex items-center gap-1 hover:text-white transition-colors py-2"
              >
                Resources
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${resourcesOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 w-52 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 space-y-1 animate-fade-in-down">
                  <a href="#how-it-works" onClick={() => setResourcesOpen(false)} className="block px-3 py-2 rounded-xl hover:bg-zinc-900 text-xs font-semibold text-zinc-200">How It Works</a>
                  <a 
                    href="#rate-cards" 
                    onClick={(e) => { e.preventDefault(); handleRateCardsClick(); }}
                    className="block px-3 py-2 rounded-xl hover:bg-zinc-900 text-xs font-semibold text-zinc-200"
                  >
                    Rate Cards
                  </a>
                </div>
              )}
            </div>

            <button onClick={onOpenContact} className="hover:text-white transition-colors">Contact</button>
          </nav>

          {/* Right CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/rider"
              className="hidden lg:flex bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all items-center gap-2"
            >
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>Rider Portal</span>
            </Link>
            <Link
              to="/business"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center gap-2 hover:scale-[1.03]"
            >
              <Store className="w-4 h-4" />
              <span>Business Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-zinc-800 px-4 pt-4 pb-6 space-y-3 animate-fade-in-down text-zinc-200">
          <div className="space-y-1 pb-2 border-b border-zinc-800/80">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">Solutions</div>
            <a 
              href="#solution-restaurant" 
              onClick={(e) => { e.preventDefault(); handleSolutionClick('restaurant'); }} 
              className="block font-semibold py-1.5 px-2 hover:text-blue-400 text-sm"
            >
              🍽️ Restaurant Delivery
            </a>
            <a 
              href="#solution-ecommerce" 
              onClick={(e) => { e.preventDefault(); handleSolutionClick('ecommerce'); }} 
              className="block font-semibold py-1.5 px-2 hover:text-blue-400 text-sm"
            >
              🛍️ E-commerce Logistics
            </a>
            <a 
              href="#solution-courier" 
              onClick={(e) => { e.preventDefault(); handleSolutionClick('courier'); }} 
              className="block font-semibold py-1.5 px-2 hover:text-blue-400 text-sm"
            >
              🚚 Courier Services
            </a>
          </div>

          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block font-semibold py-2 hover:text-white">Pricing</a>
          <a href="#about-us" onClick={() => setMobileMenuOpen(false)} className="block font-semibold py-2 hover:text-white">About Us</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block font-semibold py-2 hover:text-white">Clients</a>
          <a href="#partners" onClick={() => setMobileMenuOpen(false)} className="block font-semibold py-2 hover:text-white">Team</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block font-semibold py-2 hover:text-white">How It Works</a>
          <a href="#rate-cards" onClick={(e) => { e.preventDefault(); handleRateCardsClick(); }} className="block font-semibold py-2 hover:text-white">Rate Cards</a>
          
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <Link
              to="/business"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs"
            >
              <Store className="w-4 h-4" />
              <span>Business Portal</span>
            </Link>

            <Link
              to="/rider"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
            >
              <Bike className="w-4 h-4" />
              <span>Rider Portal</span>
            </Link>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
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
