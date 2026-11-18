import React from 'react';
import { Store, Bike, ArrowRight, Check, LayoutGrid } from 'lucide-react';
import { Link } from '../portal/router';

export default function Portals() {
  const portals = [
    {
      to: '/business',
      icon: Store,
      tag: 'For Businesses',
      title: 'Business Portal',
      text: 'For restaurants, e-commerce brands and courier services that need orders delivered.',
      points: ['Create a delivery order in under a minute', 'See the fare before you place the order', 'Track the rider live on the map'],
      cta: 'Grow Your Business',
      dark: false,
    },
    {
      to: '/rider',
      icon: Bike,
      tag: 'For Riders',
      title: 'Rider Portal',
      text: 'For delivery riders with an electric or petrol bike who want to earn with ZipGo.',
      points: ['Go online and receive nearby requests', '30 seconds to accept or decline', 'Map navigation and daily earnings'],
      cta: 'Join as Rider',
      dark: true,
    },
  ];

  return (
    <section id="portals" className="py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 uppercase tracking-widest">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Two Portals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
            One platform for businesses and riders
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Businesses place orders, riders deliver them, and ZipGo connects the two automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {portals.map(({ to, icon: Icon, tag, title, text, points, cta, dark }) => (
            <div
              key={to}
              className={`rounded-3xl p-8 flex flex-col justify-between gap-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                dark ? 'bg-[#06152B] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold tracking-wider uppercase ${dark ? 'text-emerald-400' : 'text-blue-600'}`}>{tag}</span>
                  <div className={`p-3 rounded-xl ${dark ? 'bg-emerald-500 text-slate-950' : 'bg-blue-600 text-white'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-black">{title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
                </div>
                <ul className="space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className={`flex items-start gap-2.5 text-xs font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-emerald-400' : 'text-blue-600'}`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={to}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${
                  dark
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                }`}
              >
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
