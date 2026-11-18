import React, { useEffect, useState } from 'react';
import { ClipboardList, MapPin, Loader2, Bike, Phone, CheckCircle2, Circle, X, PackagePlus, Link2, Copy, MessageCircle } from 'lucide-react';
import { Link } from '../router';
import { Card, StatusBadge, EmptyState, Button, ErrorNote, formatPKR, formatDateTime } from '../components/ui';
import MapView from '../components/MapView';
import { getRoute, haversineKm } from '../data/geo';
import { cancelOrder, ACTIVE_STATUSES } from '../data/store';

const FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'pending', label: 'Pending', match: (o) => o.status === 'pending' },
  { key: 'active', label: 'On the way', match: (o) => ACTIVE_STATUSES.includes(o.status) },
  { key: 'delivered', label: 'Delivered', match: (o) => o.status === 'delivered' },
  { key: 'closed', label: 'Failed / Cancelled', match: (o) => o.status === 'failed' || o.status === 'cancelled' },
];

export function OrdersList({ orders }) {
  const [filter, setFilter] = useState('all');
  const active = FILTERS.find((f) => f.key === filter);
  const visible = orders.filter(active.match);

  return (
    <Card>
      <div className="px-6 py-5 border-b border-slate-100 space-y-4">
        <h1 className="text-xl font-heading font-black text-slate-900">Orders</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label} ({orders.filter(f.match).length})
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders here" text="Orders you place will appear in this list.">
          <Link to="/business/new-order" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800">
            <PackagePlus className="w-4 h-4" />
            <span>Create a new order</span>
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 zg-stagger">
          {visible.map((o) => (
            <li key={o.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-900">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs text-slate-700 font-semibold truncate">
                  {o.dropName} — {o.dropAddress}
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatDateTime(o.createdAt)} · {o.distanceKm.toFixed(1)} km · {o.packageDetails}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm font-heading font-bold text-slate-900">{formatPKR(o.finalFare || o.proposedFare)}</span>
                <Link
                  to={`/business/tracking/${o.id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  {o.status === 'pending' || ACTIVE_STATUSES.includes(o.status) ? 'Track' : 'Details'}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// Link the customer can open to watch the rider live
function ShareTracking({ order }) {
  const [copied, setCopied] = useState(false);
  if (!order.trackingCode) return null;
  const link = `${window.location.origin}/track/${order.trackingCode}`;
  const message = `Your ${order.clientName} order ${order.orderNumber} is on its way with ZipGo. Track it live: ${link}`;
  const phoneDigits = (order.dropPhone || '').replace(/\D/g, '').replace(/^0/, '92');
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('Copy this tracking link:', link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm font-heading font-bold text-slate-900">
        <Link2 className="w-4 h-4 text-blue-600" />
        <span>Customer tracking link</span>
      </div>
      <p className="text-xs text-slate-500">Send this link so {order.dropName} can watch the rider on the map.</p>
      <div className="text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 break-all">{link}</div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={copy} className="py-2.5 text-xs">
          <Copy className="w-3.5 h-3.5" />
          <span>{copied ? 'Copied!' : 'Copy link'}</span>
        </Button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-bold text-xs px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </Card>
  );
}

function Timeline({ order }) {
  const steps = [
    { label: 'Order placed', at: order.createdAt },
    { label: 'Rider assigned', at: order.acceptedAt },
    { label: 'Picked up', at: order.pickedUpAt },
    { label: 'Delivered', at: order.deliveredAt },
  ];
  return (
    <ol className="space-y-2.5">
      {steps.map((step) => (
        <li key={step.label} className="flex items-center gap-2.5 text-xs">
          {step.at ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
          <span className={step.at ? 'font-semibold text-slate-900' : 'text-slate-400'}>{step.label}</span>
          {step.at && <span className="ml-auto text-[11px] text-slate-500">{formatDateTime(step.at)}</span>}
        </li>
      ))}
    </ol>
  );
}

export function LiveTracking({ db, orders, selectedId }) {
  const trackable = orders.filter((o) => o.status === 'pending' || ACTIVE_STATUSES.includes(o.status));
  const selected = orders.find((o) => o.id === selectedId) || trackable[0] || null;
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');

  const selectedKey = selected ? selected.id : '';

  // Road route between pickup and dropoff (drawn once per order)
  useEffect(() => {
    setRoute(null);
    setError('');
    if (!selected) return undefined;
    let cancelled = false;
    getRoute({ lat: selected.pickupLat, lng: selected.pickupLng }, { lat: selected.dropLat, lng: selected.dropLng }).then((r) => {
      if (!cancelled) setRoute(r.coords);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selected) {
    return (
      <Card>
        <EmptyState icon={MapPin} title="Nothing to track right now" text="When you place an order, you can watch the rider move on the map here.">
          <Link to="/business/new-order" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800">
            <PackagePlus className="w-4 h-4" />
            <span>Create a new order</span>
          </Link>
        </EmptyState>
      </Card>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(selected.status);
  const rider = selected.riderId ? db.riders[selected.riderId] : null;
  const riderHasLocation = Boolean(rider) && rider.lat != null && rider.lng != null;

  const markers = [
    { id: 'pickup', type: 'pickup', lat: selected.pickupLat, lng: selected.pickupLng, label: `Pickup: ${selected.pickupName}` },
    { id: 'dropoff', type: 'dropoff', lat: selected.dropLat, lng: selected.dropLng, label: `Dropoff: ${selected.dropName}` },
  ];
  if (isActive && riderHasLocation) {
    markers.push({ id: 'rider', type: 'rider', lat: rider.lat, lng: rider.lng, label: `Rider: ${rider.name}` });
  }

  let etaMins = null;
  if (isActive && riderHasLocation) {
    const target =
      selected.status === 'assigned'
        ? { lat: selected.pickupLat, lng: selected.pickupLng }
        : { lat: selected.dropLat, lng: selected.dropLng };
    const km = haversineKm({ lat: rider.lat, lng: rider.lng }, target) * 1.3;
    etaMins = Math.max(1, Math.ceil((km / 22) * 60));
  }

  const [cancelling, setCancelling] = useState(false);
  const handleCancel = async () => {
    setError('');
    setCancelling(true);
    try {
      await cancelOrder(selected.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-8 space-y-4">
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-lg font-heading font-black text-slate-900">Live tracking</h1>
              <p className="text-xs font-mono font-bold text-slate-500">{selected.orderNumber}</p>
            </div>
            <StatusBadge status={selected.status} />
          </div>

          <MapView className="h-80 sm:h-96" markers={markers} route={route} fitKey={`${selected.id}:${selected.status}`} />

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Rider
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Pickup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dropoff
            </span>
          </div>
        </Card>

        {selected.status === 'pending' && (
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Finding a nearby rider…</p>
                <p className="text-xs text-slate-500">Online riders within 10 km have 30 seconds each to accept.</p>
              </div>
            </div>
            <Button variant="danger" onClick={handleCancel} loading={cancelling} className="shrink-0 py-2.5">
              <X className="w-4 h-4" />
              <span>Cancel order</span>
            </Button>
          </Card>
        )}

        {selected.status === 'failed' && <ErrorNote>{selected.failureReason || 'This order could not be delivered.'}</ErrorNote>}
        <ErrorNote>{error}</ErrorNote>
      </div>

      <div className="xl:col-span-4 space-y-4">
        {isActive && rider && (
          <div className="bg-[#06152B] text-white rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{rider.name}</div>
                <div className="text-[11px] text-slate-400">
                  {rider.vehicleType === 'electric_bike' ? 'Electric bike' : 'Petrol bike'} · {rider.vehiclePlate}
                </div>
              </div>
            </div>
            {etaMins != null && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold">
                  {selected.status === 'assigned' ? 'Arriving at pickup in' : 'Arriving at customer in'}
                </div>
                <div className="text-2xl font-heading font-black text-white">~{etaMins} min</div>
              </div>
            )}
            <a href={`tel:${rider.phone}`} className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 hover:text-white">
              <Phone className="w-3.5 h-3.5" />
              <span>{rider.phone}</span>
            </a>
          </div>
        )}

        <Card className="p-5 space-y-4">
          <Timeline order={selected} />
          <dl className="text-xs space-y-2 border-t border-slate-100 pt-4">
            <div>
              <dt className="text-slate-400 font-semibold">Customer</dt>
              <dd className="text-slate-900 font-semibold">
                {selected.dropName}
                {selected.dropPhone ? ` · ${selected.dropPhone}` : ''}
              </dd>
              <dd className="text-slate-600">{selected.dropAddress}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold">Package</dt>
              <dd className="text-slate-900">
                {selected.packageDetails}
                {selected.weightKg ? ` · ${selected.weightKg} kg` : ''}
              </dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-slate-400 font-semibold">
                Fare ({selected.distanceKm.toFixed(1)} km{selected.peak ? ', peak' : ''})
              </dt>
              <dd className="text-slate-900 font-heading font-bold">{formatPKR(selected.finalFare || selected.proposedFare)}</dd>
            </div>
          </dl>
        </Card>

        {(selected.status === 'pending' || isActive) && <ShareTracking order={selected} />}

        {trackable.length > 1 && (
          <Card className="p-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1.5">Active orders</h2>
            <ul>
              {trackable.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/business/tracking/${o.id}`}
                    className={`flex items-center justify-between gap-2 px-2 py-2 rounded-xl text-xs ${
                      o.id === selected.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
