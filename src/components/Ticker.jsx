import React from 'react';

const ITEMS = [
  '100% Electric Fleet',
  'Salaried Riders',
  'Live Order Tracking',
  'Business Portal',
  'Rider Portal',
  'WhatsApp Login',
  'Lahore',
  'Fare Shown Before You Order',
];

// Slow, endless strip of keywords under the hero
export default function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden" aria-hidden="true">
      <div className="animate-marquee-left items-center py-3.5" style={{ animationDuration: '38s' }}>
        {row.concat(row).map((item, i) => (
          <span key={i} className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
            <span className="px-6">{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
