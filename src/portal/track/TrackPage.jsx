import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff, Phone, Star, Zap, Fuel, Copy, CheckCircle2, Circle, Clock, Package } from 'lucide-react';
import { BrandLogo, StatusBadge, Card } from '../components/ui';
import MapView from '../components/MapView';
import { fetchTracking } from '../data/store';
import { getRoute, haversineKm } from '../data/geo';

const POLL_MS = 5000;
const ACTIVE = ['assigned', 'picked_up', 'in_transit'];

const STEPS = [
  { key: 'createdAt', label: 'Order placed' },
  { key: 'acceptedAt', label: 'Rider assigned' },
  { key: 'pickedUpAt', label: 'On the way' },
  { key: 'deliveredAt', label: 'Delivered' },
];

const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' }) : '');

// Public live tracking page for the customer: /track/<code>
export default function TrackPage({ code }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [route, setRoute] = useState(null);
  const [copied, setCopied] = useState(false);
  const routeFrom = useRef(null);

  useEffect(() => {
    document.title = 'Track your order | ZipGo';
    let cancelled = false;
    let timer = null;

    const load = async () => {
      try {
        const result = await fetchTracking(code);
        if (cancelled) return;
        setData(result);
        setError('');
        if (['delivered', 'failed', 'cancelled'].includes(result.status)) return; // no more updates needed
      } catch (err) {
        if (cancelled) return;
        if (!data) setError(err.message || 'Tracking link not found.');
      }
      timer = setTimeout(load, POLL_MS);
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Road line from the rider (or the shop) to where they are heading
  const active = data && ACTIVE.includes(data.status);
  const riderHere = active && data.rider && data.rider.lat != null;
  useEffect(() => {
    if (!data) return;
    const toPickup = data.status === 'assigned' || data.status === 'pending';
    const from = riderHere ? { lat: data.rider.lat, lng: data.rider.lng } : data.pickup;
    const to = toPickup && riderHere ? data.pickup : data.drop;
    const last = routeFrom.current;
    const moved = !last || last.status !== data.status || haversineKm(last.point, from) > 0.3;
    if (!moved) return;
    routeFrom.current = { status: data.status, point: from };
    let cancelled = false;
    getRoute(from, to).then((r) => {
      if (!cancelled) setRoute(r.coords);
    });
    return () => {
      cancelled = true;
    };
  }, [data, riderHere]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030C19] text-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        {error ? (
          <>
            <MapPinOff className="w-10 h-10 text-slate-500" />
            <h1 className="text-xl font-heading font-black">Tracking link not found</h1>
            <p className="text-sm text-slate-400 max-w-xs">{error} Please check the link, or ask the shop to send it again.</p>
          </>
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" aria-label="Loading" />
        )}
      </div>
    );
  }

  const markers = [
    { id: 'pickup', type: 'pickup', lat: data.pickup.lat, lng: data.pickup.lng, label: data.pickup.name },
    { id: 'dropoff', type: 'dropoff', lat: data.drop.lat, lng: data.drop.lng, label: 'Your location' },
  ];
  if (riderHere) markers.push({ id: 'rider', type: 'rider', lat: data.rider.lat, lng: data.rider.lng, label: data.rider.firstName });

  let headline;
  if (data.status === 'pending') headline = 'Finding a rider for your order';
  else if (data.status === 'assigned') headline = `${data.rider ? data.rider.firstName : 'Your rider'} is going to ${data.businessName}`;
  else if (active) headline = `${data.rider ? data.rider.firstName : 'Your rider'} is on the way to you`;
  else if (data.status === 'delivered') headline = 'Your order has been delivered';
  else if (data.status === 'cancelled') headline = 'This order was cancelled';
  else headline = 'This order could not be delivered';

  const VehicleIcon = data.rider && data.rider.vehicleType === 'electric_bike' ? Zap : Fuel;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 sm:shadow-xl">
        <header className="bg-[#030C19] text-white px-4 h-16 flex items-center justify-between gap-3">
          <BrandLogo subtitle="Live Order Tracking" />
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div className="bg-[#06152B] text-white rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400">{data.orderNumber}</span>
              <StatusBadge status={data.status} />
            </div>
            <h1 className="text-lg font-heading font-black leading-snug">{headline}</h1>
            {data.etaMins != null && (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">Estimated arrival</div>
                  <div className="text-2xl font-heading font-black">~{data.etaMins} min</div>
                </div>
              </div>
            )}
            {data.failureReason && <p className="text-xs text-red-300">{data.failureReason}</p>}
          </div>

          <MapView className="h-72 sm:h-96" markers={markers} route={route} fitKey={`${data.status}:${riderHere ? 'rider' : 'none'}`} />

          {data.rider && (
            <Card className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-heading font-black shrink-0">
                  {data.rider.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{data.rider.firstName} · ZipGo rider</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <VehicleIcon className="w-3 h-3" />
                      {data.rider.vehicleType === 'electric_bike' ? 'Electric bike' : 'Bike'} · {data.rider.vehiclePlate}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {Number(data.rider.rating || 5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              {data.rider.phone && (
                <a
                  href={`tel:${data.rider.phone}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
            </Card>
          )}

          <Card className="p-5">
            <ol className="space-y-3">
              {STEPS.map((step) => (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  {data[step.key] ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                  <span className={data[step.key] ? 'font-semibold text-slate-900' : 'text-slate-400'}>{step.label}</span>
                  <span className="ml-auto text-xs text-slate-500">{formatTime(data[step.key])}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">P</span>
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">From</div>
                <div className="font-semibold text-slate-900">{data.pickup.name}</div>
                <div className="text-slate-500">{data.pickup.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">D</span>
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">To</div>
                <div className="font-semibold text-slate-900">{data.drop.name}</div>
                <div className="text-slate-500">{data.drop.address}</div>
              </div>
            </div>
            {data.packageDetails && (
              <div className="flex items-center gap-2 text-slate-600 border-t border-slate-100 pt-3">
                <Package className="w-4 h-4 text-slate-400" />
                <span>{data.packageDetails}</span>
              </div>
            )}
          </Card>

          <p className="text-center text-[11px] text-slate-400 pb-4">Delivered by ZipGo Express · Lahore's EV delivery network</p>
        </div>
      </div>
    </div>
  );
}
