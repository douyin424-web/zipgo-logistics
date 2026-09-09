import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Solutions from './components/Solutions';
import HowItWorks from './components/HowItWorks';
import CostComparison from './components/CostComparison';
import RateCalculator from './components/RateCalculator';
import AppDownload from './components/AppDownload';
import Testimonials from './components/Testimonials';
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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Header (White Header from Image 1) */}
      <Navbar onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section (Light Background from Image 1) */}
        <Hero onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

        {/* 3 Solutions Card Ribbon (Dark Navy Blue from Image 1 & 3) */}
        <Solutions onOpenContact={handleOpenContact} />

        {/* Key Metrics Stats Bar (Light background from Image 1) */}
        <StatsBar />

        {/* How ZipGo Works (5-Step Diagram from Image 1) */}
        <HowItWorks />

        {/* The Math is the Pitch / Cost Comparison */}
        <CostComparison onOpenContact={handleOpenContact} />

        {/* Interactive Volume Rate & Savings Calculator */}
        <RateCalculator onOpenContact={handleOpenContact} />

        {/* Why Businesses Choose ZipGo & App Download Showcase (Image 1) */}
        <AppDownload onOpenGetApp={handleOpenGetApp} />

        {/* Client Testimonials (Foodpanda, Daraz, Careem from Image 1) */}
        <Testimonials />
      </main>

      {/* Dark Navy Footer (Image 1) */}
      <Footer onOpenContact={handleOpenContact} onOpenGetApp={handleOpenGetApp} />

      {/* Interactive Sales Inquiry Modal */}
      <ContactModal isOpen={isContactOpen} onClose={handleCloseContact} />

      {/* 10-Day Live Countdown Get App Modal */}
      <GetAppModal isOpen={isGetAppOpen} onClose={handleCloseGetApp} />

    </div>
  );
}
