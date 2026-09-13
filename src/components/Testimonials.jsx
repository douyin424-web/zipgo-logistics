import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

export default function Testimonials() {
  const trustedClients = [
    {
      name: "Easy Bite",
      tag: "Food & Restaurant Partner",
      logo: "/client-easybite.jpg",
    },
    {
      name: "Zainab Boutique",
      tag: "Luxury Retail & E-Commerce",
      logo: "/client-zainab.jpg",
    },
    {
      name: "Lahore Couriers Service",
      tag: "Express Courier Partner",
      logo: "/client-lahore.jpg",
    },
  ];

  const reviews = [
    {
      quote: "ZipGo has transformed our delivery operations. Their reliability and real-time tracking help us serve our customers better every day.",
      author: "Hamza Ali",
      company: "Easy Bite",
      logo: "/client-easybite.jpg",
    },
    {
      quote: "The volume-based pricing and smooth dashboard make ZipGo our trusted logistics partner for nationwide deliveries.",
      author: "Zainab Khan",
      company: "Zainab Boutique",
      logo: "/client-zainab.jpg",
    },
    {
      quote: "Professional, fast and transparent. ZipGo's courier service is exactly what our business needed.",
      author: "Usman Tariq",
      company: "Lahore Couriers Service",
      logo: "/client-lahore.jpg",
    }
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-24 bg-white text-slate-900 border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== OUR TRUSTED CLIENTS TICKER / MARQUEE ===== */}
        <div className="mb-20 sm:mb-24">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Our Trusted Clients</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
              Trusted by Growing Businesses Across Pakistan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Leading brands rely on ZipGo's EV fleet and smart dispatch technology for fast, reliable daily deliveries.
            </p>
          </div>

          {/* Continuous Left-Scrolling Marquee Track */}
          <div className="relative overflow-hidden w-full py-5 bg-gradient-to-b from-slate-50/80 to-slate-100/40 rounded-3xl border border-slate-200/80 shadow-inner">
            {/* Left & Right Smooth Fade Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-left flex items-center gap-6 sm:gap-8">
              {/* Duplicated 6 times to ensure seamless infinite leftward scrolling on all screen sizes */}
              {[...trustedClients, ...trustedClients, ...trustedClients, ...trustedClients, ...trustedClients, ...trustedClients].map((client, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-white border border-slate-200/90 rounded-2xl px-5 sm:px-6 py-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all shrink-0 group"
                >
                  <div className="h-12 sm:h-14 w-20 sm:w-24 flex items-center justify-center overflow-hidden bg-white p-1 rounded-xl">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="border-l border-slate-100 pl-3.5 text-left">
                    <div className="text-xs sm:text-sm font-heading font-bold text-slate-900 whitespace-nowrap">
                      {client.name}
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide whitespace-nowrap">
                      {client.tag}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== CLIENT REVIEWS / TESTIMONIALS SECTION ===== */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
            What Our Clients Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Real feedback from enterprise partners and business owners who deliver with ZipGo.
          </p>
        </div>

        {/* 3 Clean Testimonial Cards with Prominent Logos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-blue-600 fill-blue-50 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{rev.author}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">{rev.company}</div>
                </div>

                {/* Client Logo Image — Enriched, clear, and prominently sized */}
                <div className="h-12 sm:h-14 w-24 sm:w-28 flex items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm p-1.5 shrink-0 group-hover:border-blue-400/60 transition-colors">
                  <img
                    src={rev.logo}
                    alt={rev.company}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
