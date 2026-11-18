import React, { useEffect, useRef, useState } from 'react';
import { Power, MapPin, Navigation, Clock, Route, Check, X, Phone, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Button, ErrorNote, formatPKR } from '../components/ui';
import MapView from '../components/MapView';
import { getRoute } from '../data/geo';
import {
  DISPATCH,
  setRiderStatus,
  updateRiderLocation,
  acceptOrder,
  declineOrder,
  timeoutOrderForRider,
  updateOrderStatus,
  activeOrderForRider,
  pendingRequestForRider,
  ordersForRider,
  isToday,
} from '../data/store';

const LOCATION_INTERVAL_MS = 5000; // rider location is shared every 5 seconds

// Shares the device's GPS position while the rider is online.
// Returns { status: 'waiting' | 'ok' | 'error', reason, retry }.
// reason: 'denied' | 'unavailable' | 'timeout' | 'insecure' | 'unsupported'
function useRiderGps(rider, enabled) {
  const [gps, setGps] = useState({ status: 'waiting', reason: '' });
  const [attempt, setAttempt] = useState(0);
  const riderRef = useRef(rider);
  riderRef.current = rider;

  useEffect(() => {
    if (!enabled) return undefined;
    setGps({ status: 'waiting', reason: '' });
    const riderId = riderRef.current.id;
    let lastSent = 0;
    let watchId = null;
    let stopped = false;

    // Re-send the last position every minute so a rider waiting in one place stays online
    const heartbeat = setInterval(() => {
      const r = riderRef.current;
      if (r.lat != null && r.lng != null) updateRiderLocation(riderId, r.lat, r.lng);
    }, 60000);
    const cleanup = () => {
      stopped = true;
      clearInterval(heartbeat);
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };

    if (!navigator.geolocation) {
      setGps({ status: 'error', reason: 'unsupported' });
      return cleanup;
    }
    if (window.isSecureContext === false) {
      setGps({ status: 'error', reason: 'insecure' });
      return cleanup;
    }

    const onPosition = (pos) => {
      if (stopped) return;
      setGps({ status: 'ok', reason: '' });
      const now = Date.now();
      if (now - lastSent < LOCATION_INTERVAL_MS) return;
      lastSent = now;
      updateRiderLocation(riderId, pos.coords.latitude, pos.coords.longitude);
    };

    const start = (highAccuracy) => {
      watchId = navigator.geolocation.watchPosition(
        onPosition,
        (err) => {
          if (stopped) return;
          if (err.code === 1) {
            setGps({ status: 'error', reason: 'denied' });
            return;
          }
          // No GPS signal (common on computers): retry once with the less exact network position
          if (highAccuracy) {
            navigator.geolocation.clearWatch(watchId);
            start(false);
            return;
          }
          setGps({ status: 'error', reason: err.code === 3 ? 'timeout' : 'unavailable' });
        },
        { enableHighAccuracy: highAccuracy, maximumAge: highAccuracy ? 5000 : 30000, timeout: highAccuracy ? 12000 : 20000 }
      );
    };
    start(true);

    return cleanup;
  }, [enabled, attempt]);

  return { ...gps, retry: () => setAttempt((n) => n + 1) };
}

const GPS_HELP = {
  denied:
    'Location is blocked for this site. Click the lock icon next to the address bar, set Location to "Allow", then press Try again.',
  unavailable:
    'Your device could not find its position. Turn on Location in your device settings (Windows: Settings → Privacy → Location) and check that Wi-Fi or mobile data is on, then press Try again.',
  timeout: 'Finding your position is taking too long. Move near a window or turn on Wi-Fi/mobile data, then press Try again.',
  insecure: 'Location only works on a secure address. Open the portal at http://localhost:5173 on this computer, or use the https:// website.',
  unsupported: 'This browser cannot share location. Please use an up-to-date Chrome, Edge, Safari or Firefox.',
};

// ------------------------------------------------------------ New delivery request popup
function RequestModal({ order, rider }) {
  const [secondsLeft, setSecondsLeft] = useState(DISPATCH.requestSeconds);
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) timeoutOrderForRider(order.id, rider.id);
  }, [secondsLeft, order.id, rider.id]);

  const [busy, setBusy] = useState(false);
  const handleAccept = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await acceptOrder(order.id, rider.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    if (busy) return;
    setBusy(true);
    await declineOrder(order.id, rider.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="New delivery request">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-pop-in">
        <div className="bg-[#030C19] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">New Delivery Request</div>
            <div className="text-xs font-mono text-slate-400">{order.orderNumber}</div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-full px-3 py-1.5" aria-live="off">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-heading font-black tabular-nums">{secondsLeft}s</span>
          </div>
        </div>

        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / DISPATCH.requestSeconds) * 100}%` }}
          />
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">P</span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase text-slate-400">Pickup</div>
                <div className="text-sm font-bold text-slate-900">{order.pickupName}</div>
                <div className="text-xs text-slate-500">{order.pickupAddress}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">D</span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase text-slate-400">Dropoff</div>
                <div className="text-xs text-slate-700 font-semibold">{order.dropAddress}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl py-2.5">
              <div className="text-sm font-heading font-black text-slate-900">{order.distanceKm.toFixed(1)} km</div>
              <div className="text-[10px] font-semibold text-slate-500">Distance</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl py-2.5">
              <div className="text-sm font-heading font-black text-slate-900">~{order.durationMins} min</div>
              <div className="text-[10px] font-semibold text-slate-500">Time</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl py-2.5">
              <div className="text-sm font-heading font-black text-emerald-700">{formatPKR(order.proposedFare)}</div>
              <div className="text-[10px] font-semibold text-emerald-700">Payout</div>
            </div>
          </div>

          <ErrorNote>{error}</ErrorNote>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="danger" onClick={handleDecline} disabled={busy}>
              <X className="w-4 h-4" />
              <span>Decline</span>
            </Button>
            <Button variant="success" onClick={handleAccept} loading={busy}>
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Navigation for the accepted order
function ActiveDelivery({ rider, order }) {
  const [leg, setLeg] = useState(null); // route from the rider to the current target
  const [error, setError] = useState('');
  const riderRef = useRef(rider);
  riderRef.current = rider;

  const toPickup = order.status === 'assigned';
  const pickup = { lat: order.pickupLat, lng: order.pickupLng };
  const drop = { lat: order.dropLat, lng: order.dropLng };
  const legKey = `${order.id}:${toPickup ? 'pickup' : 'dropoff'}`;

  // Road route for this leg: rider -> pickup, then pickup -> dropoff
  useEffect(() => {
    let cancelled = false;
    setLeg(null);
    const r = riderRef.current;
    const from = r.lat != null ? { lat: r.lat, lng: r.lng } : pickup;
    getRoute(from, toPickup ? pickup : drop).then((route) => {
      if (!cancelled) setLeg(route);
    });
    return () => {
      cancelled = true;
    };
  }, [legKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const markers = [
    { id: 'pickup', type: 'pickup', lat: pickup.lat, lng: pickup.lng, label: `Pickup: ${order.pickupName}` },
    { id: 'dropoff', type: 'dropoff', lat: drop.lat, lng: drop.lng, label: `Dropoff: ${order.dropName}` },
  ];
  if (rider.lat != null) markers.push({ id: 'rider', type: 'rider', lat: rider.lat, lng: rider.lng, label: 'You' });

  const [saving, setSaving] = useState(false);
  const advance = async () => {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      await updateOrderStatus(order.id, rider.id, toPickup ? 'picked_up' : 'delivered');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#06152B] text-white rounded-3xl p-5 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />
          <span>{toPickup ? 'Go to pickup' : 'Deliver to customer'}</span>
        </div>
        <div className="text-lg font-heading font-black leading-snug">{toPickup ? order.pickupName : order.dropName}</div>
        <div className="text-xs text-slate-300">{toPickup ? order.pickupAddress : order.dropAddress}</div>
        {leg ? (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-blue-400" /> {leg.distanceKm.toFixed(1)} km
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> ~{leg.durationMins} min
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Finding the best route…
          </div>
        )}
      </div>

      <MapView className="h-72 lg:h-[26rem]" markers={markers} route={leg ? leg.coords : null} fitKey={legKey} />

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-mono font-bold text-slate-500">{order.orderNumber}</div>
            <div className="text-xs text-slate-700 flex items-center gap-1.5 mt-0.5">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{order.packageDetails || 'Package'}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-heading font-black text-emerald-600">{formatPKR(order.proposedFare)}</div>
            <div className="text-[10px] font-semibold text-slate-500">Payout</div>
          </div>
        </div>
        {!toPickup && order.dropPhone && (
          <a href={`tel:${order.dropPhone}`} className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800">
            <Phone className="w-3.5 h-3.5" />
            <span>
              Call {order.dropName} · {order.dropPhone}
            </span>
          </a>
        )}
      </Card>

      <ErrorNote>{error}</ErrorNote>

      <Button variant={toPickup ? 'primary' : 'success'} className="w-full py-4" onClick={advance} loading={saving}>
        <CheckCircle2 className="w-4 h-4" />
        <span>{toPickup ? 'Picked Up — Start Delivery' : 'Mark as Delivered'}</span>
      </Button>

    </div>
  );
}

// ------------------------------------------------------------ Home tab
export default function RiderHome({ db, rider, visible }) {
  const online = rider.status === 'online';
  const active = activeOrderForRider(db, rider.id);
  const request = active ? null : pendingRequestForRider(db, rider);
  const [justDelivered, setJustDelivered] = useState(null);
  const lastActiveId = useRef(null);

  const gps = useRiderGps(rider, online);

  // Show a confirmation when the active order has just been delivered
  useEffect(() => {
    if (active) {
      lastActiveId.current = active.id;
      setJustDelivered(null);
      return;
    }
    const previous = lastActiveId.current ? db.orders[lastActiveId.current] : null;
    if (previous && previous.status === 'delivered') {
      setJustDelivered(previous);
    }
    lastActiveId.current = null;
  }, [active ? active.id : null]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayDelivered = ordersForRider(db, rider.id).filter((o) => o.status === 'delivered' && isToday(o.deliveredAt));
  const todayEarnings = todayDelivered.reduce((sum, o) => sum + (o.finalFare || o.proposedFare), 0);

  const [switching, setSwitching] = useState(false);
  const [statusError, setStatusError] = useState('');
  const toggleOnline = async () => {
    if (active || switching) return;
    setSwitching(true);
    setStatusError('');
    try {
      await setRiderStatus(rider.id, online ? 'offline' : 'online', { lat: rider.lat, lng: rider.lng });
    } catch (err) {
      setStatusError(err.message || 'Could not change your status.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      {/* The request popup shows on every tab while the rider is online */}
      {request && <RequestModal key={request.id} order={request} rider={rider} />}

      {visible && (
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          {/* Status + numbers (right side on desktop) */}
          <div className="space-y-4 lg:col-span-5 lg:order-2 lg:sticky lg:top-24 zg-stagger">
          <Card className="p-5 flex items-center justify-between gap-4">
            <div>
              <div className={`text-lg font-heading font-black ${online ? 'text-emerald-600' : 'text-slate-900'}`}>
                {online ? "You're Online" : "You're Offline"}
              </div>
              <div className="text-xs text-slate-500">
                {active ? 'Finish this delivery to go offline.' : online ? 'Waiting for delivery requests.' : 'Go online to receive orders.'}
              </div>
            </div>
            <button
              role="switch"
              aria-checked={online}
              aria-label="Online status"
              onClick={toggleOnline}
              disabled={Boolean(active) || switching}
              className={`relative w-16 h-9 rounded-full transition-colors shrink-0 disabled:opacity-60 ${online ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-transform ${
                  online ? 'translate-x-7' : ''
                }`}
              >
                <Power className={`w-3.5 h-3.5 ${online ? 'text-emerald-600' : 'text-slate-400'}`} />
              </span>
            </button>
          </Card>

          <ErrorNote>{statusError}</ErrorNote>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's earnings</div>
              <div className="text-xl font-heading font-black text-slate-900 mt-1">{formatPKR(todayEarnings)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deliveries today</div>
              <div className="text-xl font-heading font-black text-slate-900 mt-1">{todayDelivered.length}</div>
            </Card>
          </div>

          {justDelivered && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold text-sm">Delivered! You earned {formatPKR(justDelivered.finalFare || justDelivered.proposedFare)}.</p>
                <p className="mt-0.5">{justDelivered.orderNumber} is complete. Stay online for the next order.</p>
              </div>
            </div>
          )}

          {online && gps.status === 'error' && (
            <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 space-y-2">
              <p className="font-bold">Your location is not being shared, so businesses cannot see you on the map.</p>
              <p>{GPS_HELP[gps.reason] || GPS_HELP.unavailable}</p>
              {gps.reason !== 'insecure' && gps.reason !== 'unsupported' && (
                <button type="button" onClick={gps.retry} className="font-bold text-amber-900 underline underline-offset-2">
                  Try again
                </button>
              )}
            </div>
          )}
          </div>

          {/* Map / current delivery (left side on desktop) */}
          <div className="space-y-4 lg:col-span-7 lg:order-1 zg-stagger">
          {active ? (
            <ActiveDelivery rider={rider} order={active} />
          ) : online ? (
            <>
              <MapView
                className="h-64 lg:h-[30rem]"
                markers={rider.lat != null ? [{ id: 'rider', type: 'rider', lat: rider.lat, lng: rider.lng, label: 'You' }] : []}
                fitKey={rider.lat != null ? 'located' : 'none'}
              />
              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>New delivery requests appear here automatically.</span>
              </p>
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Power className="w-6 h-6" />
              </div>
              <p className="text-sm font-heading font-bold text-slate-900 mt-3">Turn the switch on to start</p>
              <p className="text-xs text-slate-500 mt-1">You have {DISPATCH.requestSeconds} seconds to accept each request.</p>
            </Card>
          )}
          </div>
        </div>
      )}
    </>
  );
}
