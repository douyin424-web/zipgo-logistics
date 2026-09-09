import React from 'react';

export default function StatsBar() {
  const stats = [
    { value: '10K+', label: 'Deliveries Completed' },
    { value: '500+', label: 'Happy Clients' },
    { value: '99.2%', label: 'On-Time Delivery' },
    { value: '150+', label: 'Riders on EV Fleet' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="bg-white border-y border-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-heading font-black text-blue-600 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
