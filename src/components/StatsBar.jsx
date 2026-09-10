import React from 'react';

export default function StatsBar() {
  const stats = [
    { value: '96%', label: 'On-Time Delivery Rate' },
    { value: '80%', label: 'Repeat Customers' },
    { value: '60K+', label: 'Deliveries Completed' },
    { value: '25+', label: 'B2B Enterprise Clients' },
  ];

  return (
    <div className="bg-[#030C19] border-y border-slate-800/80 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
          {stats.map((stat, idx) => (
            <div key={idx} className={`space-y-1.5 ${idx > 0 ? 'pt-4 md:pt-0' : ''}`}>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
