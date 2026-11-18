import React, { useState } from 'react';
import { ArrowRight, Bike, Zap, Fuel, Sparkles } from 'lucide-react';
import { AuthShell, Field, Button, ErrorNote, StepDots, inputCls } from '../components/ui';
import { requestOtp, verifyOtp, registerRider, normalizePhone } from '../data/store';

const VEHICLES = [
  { value: 'electric_bike', label: 'Electric Bike', icon: Zap },
  { value: 'motorcycle', label: 'Petrol Bike', icon: Fuel },
];

// 3520212345671 -> 35202-1234567-1
const formatCnic = (value) => {
  const d = value.replace(/\D/g, '').slice(0, 13);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
};

export default function RiderAuth() {
  // welcome | login | step1 | step2
  const [screen, setScreen] = useState('welcome');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    cnic: '',
    vehicleType: 'electric_bike',
    vehiclePlate: '',
  });

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
      const sent = await requestOtp(form.phone, 'rider');
      const code = sent.hint || '123456';
      const result = await verifyOtp(form.phone, code, 'rider');
      if (result.isNew) {
        throw new Error('No rider account found for this phone number. Please click "Create Account".');
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
    if (form.cnic.replace(/\D/g, '').length !== 13) {
      setError('CNIC must be 13 digits, e.g. 35202-1234567-1');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sent = await requestOtp(form.phone, 'rider');
      const code = sent.hint || '123456';
      await verifyOtp(form.phone, code, 'rider');
      await registerRider(form);
    } catch (err) {
      setError(err.message || 'Could not create rider account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Rider Login for quick testing
  const handleQuickDemo = async () => {
    setLoading(true);
    setError('');
    const demoPhone = '03007654321';
    try {
      const sent = await requestOtp(demoPhone, 'rider');
      const code = sent.hint || '123456';
      const result = await verifyOtp(demoPhone, code, 'rider');
      if (result.isNew) {
        await registerRider({
          name: 'Hassan Ali (EV Rider)',
          phone: demoPhone,
          email: 'hassan@zipgo.pk',
          cnic: '35202-1234567-1',
          vehicleType: 'electric_bike',
          vehiclePlate: 'LEV-2026',
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
      <AuthShell badge="Rider Portal" title="Join as Rider" subtitle="Go online, accept nearby delivery requests and get paid per order.">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-600">You need your CNIC, your bike's number plate and a phone number.</p>
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
      <AuthShell badge="Rider Portal" title="Welcome back" subtitle="Log in with your phone number (OTP bypass active).">
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
      <AuthShell badge="Rider Portal" title="Create your account" subtitle="Step 1 of 2 — about you">
        <StepDots total={2} current={1} />
        <form onSubmit={handleStep1} className="space-y-4">
          <Field label="Full name">
            <input type="text" required autoFocus placeholder="e.g. Hassan Ali" value={form.name} onChange={set('name')} className={inputCls} />
          </Field>
          <Field label="Phone number">
            <input type="tel" required placeholder="0300 1234567" value={form.phone} onChange={set('phone')} className={inputCls} />
          </Field>
          <Field label="Email (optional)">
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={inputCls} />
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
    <AuthShell badge="Rider Portal" title="Verification & vehicle" subtitle="Step 2 of 2 — CNIC and bike details">
      <StepDots total={2} current={2} />
      <form onSubmit={handleStep2} className="space-y-4">
        <Field label="CNIC number">
          <input
            type="text"
            inputMode="numeric"
            required
            autoFocus
            placeholder="35202-1234567-1"
            value={form.cnic}
            onChange={(e) => setForm({ ...form, cnic: formatCnic(e.target.value) })}
            className={inputCls}
          />
        </Field>

        <div>
          <span className="block text-xs font-semibold text-slate-600 mb-1.5">Vehicle</span>
          <div className="grid grid-cols-2 gap-3">
            {VEHICLES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, vehicleType: value })}
                aria-pressed={form.vehicleType === value}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-xs font-bold transition-colors ${
                  form.vehicleType === value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Number plate">
          <input type="text" required placeholder="e.g. LEA-1234" value={form.vehiclePlate} onChange={set('vehiclePlate')} className={`${inputCls} uppercase`} />
        </Field>

        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" loading={loading} className="w-full">
          Create Rider Account
        </Button>
        <button type="button" onClick={() => go('step1')} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900">
          Back
        </button>
      </form>
    </AuthShell>
  );
}
