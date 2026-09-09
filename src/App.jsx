import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Solutions from './components/Solutions';
import HowItWorks from './components/HowItWorks';
import CostComparison from './components/CostComparison';
import RateCalculator from './components/RateCalculator';
import AppDownload from './components/AppDownload';
import Testimonials from './components/Testimonials';
import Partners from './components/Partners';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import GetAppModal from './components/GetAppModal';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isGetAppOpen, setIsGetAppOpen] = useState(false);

  const handleOpenContact = () => setIsContactOpen(true);
  const handleCloseContact = () => setIsContactOpen(false);

  const handleOpenGetApp = () => setIsGetAppOpen(true);
  const handleCloseGetApp = () => setIsGetAppOpen(false);

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
      <Navbar onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

      {/* Main Content Sections with Animations */}
      <main>
        {/* Hero Section */}
        <Hero onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

        {/* 3 Solutions Card Ribbon */}
        <div className="scroll-reveal">
          <Solutions onOpenContact={handleOpenContact} />
        </div>

        {/* Key Metrics Stats Bar */}
        <div className="scroll-reveal">
          <StatsBar />
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

        {/* Why Businesses Choose ZipGo & App Download Showcase */}
        <div className="scroll-reveal">
          <AppDownload onOpenGetApp={handleOpenGetApp} />
        </div>

        {/* Client Testimonials */}
        <div className="scroll-reveal">
          <Testimonials />
        </div>

        {/* Leadership / Partners Section (CEO #1, General Partner #2, CTO #3) */}
        <Partners />
      </main>

      {/* Dark Navy Footer */}
      <Footer onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

      {/* Interactive Sales Inquiry Modal */}
      <ContactModal isOpen={isContactOpen} onClose={handleCloseContact} />

      {/* 10-Day Live Countdown Get App Modal */}
      <GetAppModal isOpen={isGetAppOpen} onClose={handleCloseGetApp} />

    </div>
  );
}
