import React from 'react';

export default function StatsBar() {
  const stats = [
    { value: '96%', label: 'On-Time Delivery Rate', color: 'from-emerald-400 via-teal-300 to-cyan-400' },
    { value: '80%', label: 'Repeat Customers', color: 'from-blue-400 via-indigo-300 to-sky-400' },
    { value: '60K+', label: 'Deliveries Completed', color: 'from-amber-400 via-yellow-300 to-orange-400' },
    { value: '25+', label: 'B2B Enterprise Clients', color: 'from-cyan-400 via-sky-300 to-blue-400' },
  ];

  return (
    <div className="bg-black border-y border-zinc-800 py-12 sm:py-14 text-white relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.06),_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`space-y-2 group transition-transform duration-300 hover:-translate-y-1 ${
                idx > 0 ? 'pt-6 sm:pt-4 lg:pt-0' : ''
              }`}
            >
              <div className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${stat.color} drop-shadow-sm`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wide uppercase group-hover:text-white transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
