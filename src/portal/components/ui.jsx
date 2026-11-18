import React, { useState } from 'react';
import { Loader2, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from '../router';

export const formatPKR = (amount) => `PKR ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`;

export const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '—';

export const inputCls =
  'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const STATUS = {
  pending: { label: 'Finding rider', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  assigned: { label: 'Rider assigned', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  picked_up: { label: 'On the way', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  in_transit: { label: 'On the way', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const statusLabel = (status) => (STATUS[status] ? STATUS[status].label : status);

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20',
  dark: 'bg-slate-950 hover:bg-slate-800 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
  outline: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300',
  danger: 'bg-white hover:bg-red-50 text-red-600 border border-red-200',
};

export function Button({ variant = 'primary', loading = false, className = '', children, disabled, ...rest }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm ${className}`}>{children}</div>;
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="text-center py-12 px-6">
      {Icon && (
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-heading font-bold text-slate-900">{title}</h3>
      {text && <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function BrandLogo({ subtitle }) {
  return (
    <Link to="/" className="flex items-center gap-3 min-w-0">
      <img src="/zipgo-logo.png" alt="ZipGo Logistics" className="h-10 w-10 object-contain shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm font-heading font-bold text-white leading-tight">ZipGo</span>
        {subtitle && <span className="block text-[11px] text-blue-300 font-semibold truncate">{subtitle}</span>}
      </span>
    </Link>
  );
}

// Full-page navy background with a white card — used by both portals' sign-in screens
export function AuthShell({ badge, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#030C19] text-white flex flex-col">
      <div className="max-w-md w-full mx-auto px-4 pt-6 flex items-center justify-between">
        <BrandLogo />
        <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to website</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            {badge && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950 border border-blue-800/60 px-3 py-1 rounded-full">
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all ${i < current ? 'w-6 bg-blue-600' : 'w-3 bg-slate-200'}`} />
      ))}
    </div>
  );
}

// WhatsApp 6-digit code step
export function OtpStep({ phone, hint, onVerify, onBack, onResend }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message || 'Could not verify the code');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await onResend();
      setResent(true);
    } catch (err) {
      setError(err.message || 'Could not resend the code');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
        <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-900">
          We sent a 6-digit code on WhatsApp to <strong>{phone}</strong>.
        </p>
      </div>

      <Field label="Verification code">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className={`${inputCls} text-center text-2xl font-heading font-bold tracking-[0.5em]`}
        />
      </Field>

      {hint && (
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          Test mode: use code <strong className="text-slate-900">{hint}</strong>.
        </p>
      )}

      <ErrorNote>{error}</ErrorNote>

      <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">
        Verify & Continue
      </Button>

      <div className="flex items-center justify-between text-xs font-semibold">
        <button type="button" onClick={onBack} className="text-slate-500 hover:text-slate-900">
          Change number
        </button>
        <button type="button" onClick={handleResend} className="text-blue-600 hover:text-blue-800">
          {resent ? 'Code sent again' : 'Resend code'}
        </button>
      </div>
    </form>
  );
}
