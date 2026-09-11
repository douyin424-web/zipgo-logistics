import React, { useEffect, useRef } from 'react';
import { Linkedin, Twitter, Mail, Award, Users, Zap } from 'lucide-react';

// Scroll Animation Hook
export function useScrollAnimation(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('is-visible'), delay);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
}

function PartnerCard({ image, name, role, tag, bio, icon: Icon, delay = 0, initials, linkedin, twitter, email }) {
  const ref = useScrollAnimation(delay);
  return (
    <div
      ref={ref}
      className="scroll-reveal group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between"
    >
      <div>
        {/* Photo Area */}
        <div className="relative bg-white h-72 overflow-hidden flex items-end justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent opacity-20 pointer-events-none" />
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-300 shadow-inner flex items-center justify-center">
                <span className="text-2xl font-heading font-black text-slate-500">{initials}</span>
              </div>
            </div>
          )}
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
        </div>
      </div>

      {/* Social Links Area */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          {linkedin ? (
            <a 
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn Profile`}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed">
              <Linkedin className="w-3.5 h-3.5" />
            </span>
          )}

          {twitter ? (
            <a 
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} X Profile`}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-black hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed">
              <Twitter className="w-3.5 h-3.5" />
            </span>
          )}

          {email ? (
            <a 
              href={`mailto:${email}`}
              aria-label={`Email ${name}`}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed">
              <Mail className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Partners() {
  const headingRef = useScrollAnimation(0);

  // ORDER: 1=CEO, 2=General Partner (Muhammad Nasrullah with exact profile links), 3=CTO
  const partners = [
    {
      image: '/partner-eman.png',
      name: 'Eman Anjum',
      role: 'Founder & CEO',
      tag: 'Founder & CEO',
      icon: Users,
      bio: 'Entrepreneur and logistics innovator building Pakistan\'s most trusted EV delivery network from the ground up.',
      delay: 0,
      linkedin: 'https://www.linkedin.com/company/zipgo-ev-logistics',
      twitter: null,
      email: null,
    },
    {
      image: '/partner-nasrullah.png',
      name: 'Muhammad Nasrullah',
      role: 'General Partner, ZipGo Logistics',
      tag: 'General Partner',
      icon: Award,
      bio: 'Visionary leader driving ZipGo\'s growth strategy, strategic partnerships and investor relations across Pakistan\'s logistics landscape.',
      delay: 150,
      linkedin: 'https://www.linkedin.com/in/muhammadnasrullah786',
      twitter: 'https://x.com/nasrullahSW',
      email: 'muhammadnasrullah57109973@gmail.com',
    },
    {
      image: null,
      initials: 'UF',
      name: 'Umar Farooq',
      role: 'Chief Technology Officer',
      tag: 'CTO',
      icon: Zap,
      bio: 'Engineering lead architecting ZipGo\'s real-time dispatch platform, tracking systems and operations technology.',
      delay: 300,
      linkedin: null,
      twitter: null,
      email: null,
    },
  ];

  return (
    <section id="partners" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(37,99,235,0.04),_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <PartnerCard key={partner.name} {...partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
