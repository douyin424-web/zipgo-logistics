import React, { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Ticker from './components/Ticker';
import Portals from './components/Portals';
import Solutions from './components/Solutions';
import HowItWorks from './components/HowItWorks';
import CostComparison from './components/CostComparison';
import RateCalculator from './components/RateCalculator';
import WhyZipGo from './components/WhyZipGo';
import Testimonials from './components/Testimonials';
import Partners from './components/Partners';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleOpenContact = useCallback(() => setIsContactOpen(true), []);
  const handleCloseContact = useCallback(() => setIsContactOpen(false), []);

  // Global scroll observer for smooth animation across all sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar onOpenContact={handleOpenContact} />

      {/* Main Content Sections with Animations */}
      <main>
        {/* Hero Section */}
        <Hero onOpenContact={handleOpenContact} />

        <Ticker />

        {/* 3 Solutions Card Ribbon */}
        <div className="scroll-reveal">
          <Solutions onOpenContact={handleOpenContact} />
        </div>

        {/* Key Metrics Stats Bar */}
        <div className="scroll-reveal">
          <StatsBar />
        </div>

        {/* Business Portal & Rider Portal entry points */}
        <div className="scroll-reveal">
          <Portals />
        </div>

        {/* How ZipGo Works (5-Step Diagram) */}
        <div className="scroll-reveal">
          <HowItWorks />
        </div>

        {/* The Math is the Pitch / Cost Comparison */}
        <div className="scroll-reveal">
          <CostComparison onOpenContact={handleOpenContact} />
        </div>

        {/* Interactive Volume Rate & Savings Calculator */}
        <div className="scroll-reveal">
          <RateCalculator onOpenContact={handleOpenContact} />
        </div>

        {/* Why Businesses Choose ZipGo & Quote Request Card */}
        <div className="scroll-reveal">
          <WhyZipGo onOpenContact={handleOpenContact} />
        </div>

        {/* Client Testimonials */}
        <div className="scroll-reveal">
          <Testimonials />
        </div>

        {/* Leadership / Partners Section (CEO #1, General Partner #2, CTO #3) */}
        <Partners />
      </main>

      {/* Dark Navy Footer */}
      <Footer onOpenContact={handleOpenContact} />

      {/* Interactive Sales Inquiry Modal */}
      <ContactModal isOpen={isContactOpen} onClose={handleCloseContact} />

    </div>
  );
}
