import React from 'react';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      quote: "ZipGo has transformed our delivery operations. Their reliability and real-time tracking help us serve our customers better every day.",
      author: "Hamza Ali",
      company: "Foodpanda Pakistan",
      brandColor: "bg-pink-50 text-pink-600 border-pink-200",
      logoText: "foodpanda"
    },
    {
      quote: "The volume-based pricing and smooth dashboard make ZipGo our trusted logistics partner for nationwide deliveries.",
      author: "Zainab Khan",
      company: "Daraz Seller",
      brandColor: "bg-orange-50 text-orange-600 border-orange-200",
      logoText: "Daraz"
    },
    {
      quote: "Professional, fast and transparent. ZipGo's courier service is exactly what our business needed.",
      author: "Usman Tariq",
      company: "Careem Business",
      brandColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
      logoText: "Careem"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title (Exact Image 1) */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
            What Our Clients Say
          </h2>
        </div>

        {/* 3 Clean Testimonial Cards (Exact Image 1 layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-blue-600 fill-blue-50" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{rev.author}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{rev.company}</div>
                </div>

                {/* Client Logo Brand Badge */}
                <div className={`px-3 py-1 rounded-xl text-xs font-black border tracking-tight ${rev.brandColor}`}>
                  {rev.logoText}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
