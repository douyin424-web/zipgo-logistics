import React, { useEffect, useState } from 'react';
import { X, Send, CheckCircle2, Zap, Loader2, AlertCircle } from 'lucide-react';
import { sendForm, CONTACT_EMAIL } from '../lib/formsubmit';
import useModal from '../lib/useModal';

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    category: 'Restaurant',
    city: 'Lahore',
    dailyOrders: '50-100',
    phone: '',
    message: ''
  });

  useModal(isOpen, onClose);

  // Start with a fresh form state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      // Sends form data to the ZipGo inbox via FormSubmit AJAX
      await sendForm({
        _subject: `New EV Fleet Lead: ${formData.businessName || formData.name} (${formData.city})`,
        'Full Name': formData.name,
        'Business Name': formData.businessName,
        'Business Type': formData.category,
        'City': formData.city,
        'Estimated Daily Orders': formData.dailyOrders,
        'WhatsApp / Phone': formData.phone,
        'Additional Requirements': formData.message || 'None provided',
        'Submitted At': new Date().toLocaleString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      // Tell the user honestly so the lead is not silently lost
      setError(`We couldn't send your request. Please try again, or email us at ${CONTACT_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setLoading(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-label="Request a rate quote">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white space-y-6 my-auto animate-pop-in">
        
        {/* Close Button */}
        <button 
          onClick={handleReset}
          aria-label="Close"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-400 text-xs font-bold border border-blue-800/60 uppercase">
                <Zap className="w-3.5 h-3.5 fill-blue-400" />
                <span>Talk to ZipGo Fleet Sales</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-white">
                Get Your Custom EV Rate Card
              </h3>
              <p className="text-xs text-slate-300">
                Enter your business details below. Our Lahore operations team will send your custom rate quote within 30 minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore Kitchens"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Business Type</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Restaurant">Restaurant / Food Delivery</option>
                    <option value="E-Commerce">E-Commerce Brand</option>
                    <option value="Courier">Courier / Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad / Rawalpindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Estimated Daily Orders</label>
                  <select
                    value={formData.dailyOrders}
                    onChange={(e) => setFormData({ ...formData, dailyOrders: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="10-50">10 – 50 orders / day</option>
                    <option value="50-100">50 – 100 orders / day</option>
                    <option value="100-500">100 – 500 orders / day</option>
                    <option value="500+">500+ Enterprise volume</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Additional Requirements (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Special instructions or volume details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>{loading ? 'Sending...' : 'Submit Rate Quote Request'}</span>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white">Quote Request Received!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Thank you <span className="text-blue-400 font-bold">{formData.name}</span>. Our ZipGo sales representative will reach out to <span className="text-blue-400 font-bold">{formData.phone}</span> within 30 minutes with your tailored rate card.
            </p>
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
