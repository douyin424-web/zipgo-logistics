import React, { useEffect, useState } from 'react';
import { PackagePlus, Loader2, Zap, Route, Clock } from 'lucide-react';
import { navigate } from '../router';
import { Card, Field, Button, ErrorNote, formatPKR, inputCls } from '../components/ui';
import AddressPicker from '../components/AddressPicker';
import { PRICING } from '../data/geo';
import { createOrder, estimateFare } from '../data/store';

const ORDER_TYPES = [
  { value: 'restaurant', label: 'Food / Restaurant' },
  { value: 'ecommerce', label: 'E-commerce parcel' },
  { value: 'courier', label: 'Courier / Documents' },
];

const defaultType = (businessType) => {
  const t = (businessType || '').toLowerCase();
  if (t.includes('commerce')) return 'ecommerce';
  if (t.includes('courier')) return 'courier';
  return 'restaurant';
};

export default function NewOrder({ business }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    packageDetails: '',
    weightKg: '',
    orderType: defaultType(business.businessType),
  });
  const [drop, setDrop] = useState({ address: '', lat: null, lng: null });
  const [estimate, setEstimate] = useState(null); // { distanceKm, durationMins, approximate, fare }
  const [estimating, setEstimating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const pickup = { address: business.address, lat: business.lat, lng: business.lng };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Fare estimate as soon as the dropoff is pinned
  useEffect(() => {
    if (drop.lat == null) {
      setEstimate(null);
      return undefined;
    }
    let cancelled = false;
    setEstimating(true);
    setError('');
    estimateFare(pickup, drop)
      .then((result) => {
        if (!cancelled) setEstimate(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setEstimate(null);
          setError(err.message || 'Could not calculate the fare.');
        }
      })
      .finally(() => {
        if (!cancelled) setEstimating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [drop.lat, drop.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (placing) return;
    setError('');
    if (!drop.address.trim() || drop.lat == null) {
      setError("Enter the customer's address and pin it on the map.");
      return;
    }
    if (!estimate) {
      setError('Please wait for the fare estimate.');
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder(business.id, {
        ...form,
        pickup,
        drop,
        distanceKm: estimate.distanceKm,
        durationMins: estimate.durationMins,
        fare: estimate.fare.total,
        peak: estimate.fare.peak,
      });
      navigate(`/business/tracking/${order.id}`);
    } catch (err) {
      setError(err.message || 'Could not place the order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <Card className="xl:col-span-7 p-6 sm:p-7 space-y-5">
        <div>
          <h1 className="text-xl font-heading font-black text-slate-900">New delivery order</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pickup from <strong className="text-slate-700">{business.businessName}</strong> — {business.address}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer name">
            <input type="text" required placeholder="e.g. Ali Ahmed" value={form.customerName} onChange={set('customerName')} className={inputCls} />
          </Field>
          <Field label="Customer phone (optional)">
            <input type="tel" placeholder="0300 1234567" value={form.customerPhone} onChange={set('customerPhone')} className={inputCls} />
          </Field>
        </div>

        <AddressPicker label="Customer address (dropoff)" markerType="dropoff" value={drop} onChange={setDrop} />

        <Field label="What are you sending?">
          <input type="text" required placeholder="e.g. 2 burgers, 1 drink" value={form.packageDetails} onChange={set('packageDetails')} className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Order type">
            <select value={form.orderType} onChange={set('orderType')} className={inputCls}>
              {ORDER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Weight in kg (optional)">
            <input type="number" min="0" step="0.1" placeholder="e.g. 1.5" value={form.weightKg} onChange={set('weightKg')} className={inputCls} />
          </Field>
        </div>
      </Card>

      <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-24">
        <div className="bg-[#06152B] text-white rounded-3xl p-6 sm:p-7 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-300">Fare estimate</h2>

          {!estimate && !estimating && <p className="text-sm text-slate-400">Pin the customer's address to see the fare.</p>}

          {estimating && (
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculating route…</span>
            </p>
          )}

          {estimate && !estimating && (
            <>
              <div className="text-4xl font-heading font-black text-white">{formatPKR(estimate.fare.total)}</div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <Route className="w-4 h-4 text-blue-400" />
                  <div className="font-bold text-white mt-1.5">{estimate.distanceKm.toFixed(1)} km</div>
                  <div className="text-slate-400">Distance</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div className="font-bold text-white mt-1.5">~{estimate.durationMins} mins</div>
                  <div className="text-slate-400">Ride time</div>
                </div>
              </div>

              <dl className="text-xs space-y-1.5 border-t border-slate-800 pt-4">
                <div className="flex justify-between text-slate-300">
                  <dt>Base fare</dt>
                  <dd className="font-mono">{formatPKR(PRICING.baseFare)}</dd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <dt>
                    Distance ({formatPKR(PRICING.perKm)} × {estimate.distanceKm.toFixed(1)} km)
                  </dt>
                  <dd className="font-mono">{formatPKR(estimate.fare.base - PRICING.baseFare)}</dd>
                </div>
                {estimate.fare.peak && (
                  <div className="flex justify-between text-amber-300 font-semibold">
                    <dt className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Peak hours ×{PRICING.peakMultiplier}</span>
                    </dt>
                    <dd className="font-mono">+{formatPKR(estimate.fare.total - estimate.fare.base)}</dd>
                  </div>
                )}
              </dl>

              {estimate.approximate && (
                <p className="text-[11px] text-amber-300">
                  Road routing is unavailable right now, so this distance is an estimate from a straight line.
                </p>
              )}
            </>
          )}
        </div>

        <ErrorNote>{error}</ErrorNote>

        <Button type="submit" variant="success" loading={placing} className="w-full py-4">
          <PackagePlus className="w-4 h-4" />
          <span>Place Order</span>
        </Button>
        <p className="text-[11px] text-slate-500 text-center">Nearby online riders are notified as soon as you place the order.</p>
      </div>
    </form>
  );
}
