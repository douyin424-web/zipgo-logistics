import React, { useState } from 'react';
import { ArrowRight, Store, Sparkles } from 'lucide-react';
import { AuthShell, Field, Button, ErrorNote, StepDots, inputCls } from '../components/ui';
import AddressPicker from '../components/AddressPicker';
import { requestOtp, verifyOtp, registerBusiness, normalizePhone } from '../data/store';

const BUSINESS_TYPES = ['Restaurant', 'E-commerce', 'Courier Service', 'Other'];

export default function BusinessAuth() {
  // welcome | login | step1 | step2
  const [screen, setScreen] = useState('welcome');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    email: '',
    businessType: 'Restaurant',
    landmark: '',
  });
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const go = (next) => {
    setError('');
    setScreen(next);
  };

  // Direct login without OTP screen
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const sent = await requestOtp(form.phone, 'business');
      const code = sent.hint || '123456';
      const result = await verifyOtp(form.phone, code, 'business');
      if (result.isNew) {
        throw new Error('No business account found for this phone number. Please click "Create Account".');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    try {
      normalizePhone(form.phone);
    } catch (err) {
      setError(err.message);
      return;
    }
    go('step2');
  };

  // Direct registration without OTP screen
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!location.address.trim()) {
      setError('Enter your business address.');
      return;
    }
    if (location.lat == null) {
      setError('Pin your business on the map so riders can find the pickup point.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sent = await requestOtp(form.phone, 'business');
      const code = sent.hint || '123456';
      await verifyOtp(form.phone, code, 'business');
      await registerBusiness({ ...form, ...location });
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login for quick testing
  const handleQuickDemo = async () => {
    setLoading(true);
    setError('');
    const demoPhone = '03001234567';
    try {
      const sent = await requestOtp(demoPhone, 'business');
      const code = sent.hint || '123456';
      const result = await verifyOtp(demoPhone, code, 'business');
      if (result.isNew) {
        await registerBusiness({
          businessName: 'ABC Restaurant (DHA)',
          phone: demoPhone,
          email: 'demo@abcrestaurant.com',
          businessType: 'Restaurant',
          address: 'Phase 5, DHA Lahore',
          landmark: 'Commercial Area',
          lat: 31.4697,
          lng: 74.3728,
        });
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  if (screen === 'welcome') {
    return (
      <AuthShell
        badge="Business Portal"
        title="Grow Your Business with ZipGo"
        subtitle="Create delivery orders, get a rider in seconds and track every order live."
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-600">For restaurants, e-commerce brands and courier services in Lahore.</p>
        </div>

        <Button className="w-full" onClick={() => go('step1')}>
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button variant="outline" className="w-full" onClick={() => go('login')}>
          I already have an account
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Quick Testing</span></div>
        </div>

        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>⚡ 1-Click Instant Demo Login</span>
        </button>
      </AuthShell>
    );
  }

  if (screen === 'login') {
    return (
      <AuthShell badge="Business Portal" title="Welcome back" subtitle="Log in with your business phone number (OTP bypass active).">
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="Phone number">
            <input type="tel" required autoFocus placeholder="0300 1234567" value={form.phone} onChange={set('phone')} className={inputCls} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" loading={loading} className="w-full">
            Log In Directly
          </Button>
          <button type="button" onClick={() => go('welcome')} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900">
            Back
          </button>
        </form>
      </AuthShell>
    );
  }

  if (screen === 'step1') {
    return (
      <AuthShell badge="Business Portal" title="Create your account" subtitle="Step 1 of 2 — your business">
        <StepDots total={2} current={1} />
        <form onSubmit={handleStep1} className="space-y-4">
          <Field label="Business name">
            <input type="text" required autoFocus placeholder="e.g. ABC Restaurant" value={form.businessName} onChange={set('businessName')} className={inputCls} />
          </Field>
          <Field label="Phone number">
            <input type="tel" required placeholder="0300 1234567" value={form.phone} onChange={set('phone')} className={inputCls} />
          </Field>
          <Field label="Email (optional)">
            <input type="email" placeholder="you@business.com" value={form.email} onChange={set('email')} className={inputCls} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" className="w-full">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button type="button" onClick={() => go('welcome')} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900">
            Back
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell badge="Business Portal" title="Where do riders pick up?" subtitle="Step 2 of 2 — business type and address">
      <StepDots total={2} current={2} />
      <form onSubmit={handleStep2} className="space-y-4">
        <Field label="Business type">
          <select value={form.businessType} onChange={set('businessType')} className={inputCls}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <AddressPicker
          label="Business address (pickup point)"
          markerType="pickup"
          placeholder="e.g. DHA Phase 5, Lahore"
          value={location}
          onChange={setLocation}
        />
        <Field label="Landmark (optional)">
          <input type="text" placeholder="e.g. Near Y Block market" value={form.landmark} onChange={set('landmark')} className={inputCls} />
        </Field>
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" loading={loading} className="w-full">
          Create Business Account
        </Button>
        <button type="button" onClick={() => go('step1')} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900">
          Back
        </button>
      </form>
    </AuthShell>
  );
}
