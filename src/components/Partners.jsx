import React, { useEffect, useRef } from 'react';
import { Linkedin, Twitter, Mail, Award, Users, Zap } from 'lucide-react';

// Scroll Animation Hook
function useScrollAnimation() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function PartnerCard({ image, name, role, tag, bio, icon: Icon, delay = 0 }) {
  const ref = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="scroll-reveal group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Photo Area */}
      <div className="relative bg-slate-50 h-72 overflow-hidden flex items-end justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100 to-transparent opacity-40 pointer-events-none" />
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        {/* Role Tag Badge */}
        <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-blue-400" />
          <span>{tag}</span>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-6 space-y-3">
        <div>
          <h3 className="text-base font-heading font-black text-slate-900">{name}</h3>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">{role}</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{bio}</p>

        {/* Social Links */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all">
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-400 hover:text-white text-slate-500 flex items-center justify-center transition-all">
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-500 flex items-center justify-center transition-all">
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Partners() {
  const headingRef = useScrollAnimation();

  const partners = [
    {
      image: '/partner-nasrullah.jpg',
      name: 'Muhammad Nasrullah',
      role: 'General Partner, ZipGo Logistics',
      tag: 'General Partner',
      icon: Award,
      bio: 'Visionary leader driving ZipGo\'s growth strategy and investor relations across Pakistan\'s logistics landscape.',
      delay: 0,
    },
    {
      image: '/partner-eman.jpg',
      name: 'Eman Anjum',
      role: 'CEO & Co-Founder',
      tag: 'CEO & Co-Founder',
      icon: Users,
      bio: 'Entrepreneur and logistics innovator building Pakistan\'s most trusted EV delivery network from the ground up.',
      delay: 150,
    },
    {
      image: null,
      name: 'Umar Farooq',
      role: 'Chief Technology Officer',
      tag: 'CTO',
      icon: Zap,
      bio: 'Engineering lead architecting ZipGo\'s real-time dispatch platform, tracking systems and operations technology.',
      delay: 300,
    },
  ];

  return (
    <section id="partners" className="py-20 bg-white relative overflow-hidden">

      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(37,99,235,0.04),_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div ref={headingRef} className="scroll-reveal text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Leadership Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
            The People Behind <span className="text-blue-600">ZipGo</span>
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Experienced founders and operators on a mission to make logistics transparent, electric, and reliable across Pakistan.
          </p>
        </div>

        {/* Partners Grid — 2 cards centered if 3rd has no image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner) => (
            partner.image ? (
              <PartnerCard key={partner.name} {...partner} />
            ) : (
              /* CTO Card - No photo, elegant placeholder */
              <div
                key={partner.name}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                style={{ transitionDelay: `${partner.delay}ms` }}
              >
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-72 flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-slate-300/50 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-3xl font-heading font-black text-slate-500">UF</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>CTO</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-base font-heading font-black text-slate-900">Umar Farooq</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">Chief Technology Officer</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{partner.bio}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-400 hover:text-white text-slate-500 flex items-center justify-center transition-all">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-500 flex items-center justify-center transition-all">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

      </div>
    </section>
  );
}
