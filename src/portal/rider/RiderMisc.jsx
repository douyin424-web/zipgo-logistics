import React, { useState } from 'react';
import { ClipboardList, Wallet, LogOut, Star, Zap, Fuel, Phone, Mail, CreditCard } from 'lucide-react';
import { navigate } from '../router';
import { Card, StatusBadge, EmptyState, Button, formatPKR, formatDateTime } from '../components/ui';
import { ordersForRider, logout, setRiderStatus, activeOrderForRider, isToday, isWithinDays } from '../data/store';

// ------------------------------------------------------------ Orders history
export function RiderOrders({ db, rider }) {
  const orders = ordersForRider(db, rider.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-heading font-black text-slate-900">Orders</h1>
      <Card>
        {orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders yet" text="Orders you accept will be listed here." />
        ) : (
          <ul className="divide-y divide-slate-100 zg-stagger">
            {orders.map((o) => (
              <li key={o.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs text-slate-700 font-semibold">{o.pickupName} → {o.dropName}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {formatDateTime(o.deliveredAt || o.acceptedAt)} · {o.distanceKm.toFixed(1)} km
                  </span>
                  <span className="text-sm font-heading font-bold text-slate-900">{formatPKR(o.finalFare || o.proposedFare)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ Earnings
const PERIODS = [
  { key: 'today', label: 'Today', match: (o) => isToday(o.deliveredAt) },
  { key: 'week', label: 'This Week', match: (o) => isWithinDays(o.deliveredAt, 7) },
  { key: 'month', label: 'This Month', match: (o) => isWithinDays(o.deliveredAt, 30) },
];

export function RiderEarnings({ db, rider }) {
  const [period, setPeriod] = useState('today');
  const delivered = ordersForRider(db, rider.id).filter((o) => o.status === 'delivered');
  const list = delivered.filter(PERIODS.find((p) => p.key === period).match);
  const total = list.reduce((sum, o) => sum + (o.finalFare || o.proposedFare), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-heading font-black text-slate-900">Earnings</h1>

      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-200">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            aria-pressed={period === p.key}
            className={`py-2 rounded-xl text-xs font-bold transition-colors ${period === p.key ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-[#06152B] text-white rounded-3xl p-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Total earned</div>
        <div className="text-4xl font-heading font-black mt-1">{formatPKR(total)}</div>
        <div className="grid grid-cols-2 gap-3 mt-5 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <div className="text-lg font-heading font-black">{list.length}</div>
            <div className="text-slate-400">Deliveries</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <div className="text-lg font-heading font-black">{formatPKR(list.length ? total / list.length : 0)}</div>
            <div className="text-slate-400">Average per delivery</div>
          </div>
        </div>
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState icon={Wallet} title="No earnings in this period" text="Complete deliveries to see your earnings here." />
        ) : (
          <ul className="divide-y divide-slate-100 zg-stagger">
            {list.map((o) => (
              <li key={o.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-mono font-bold text-slate-900">{o.orderNumber}</div>
                  <div className="text-slate-500">{formatDateTime(o.deliveredAt)}</div>
                </div>
                <span className="font-heading font-bold text-emerald-600 shrink-0">+{formatPKR(o.finalFare || o.proposedFare)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ Profile
const maskCnic = (cnic) => (cnic && cnic.length >= 15 ? `${cnic.slice(0, 5)}-•••••••-${cnic.slice(-1)}` : cnic || '—');

export function RiderProfile({ db, rider }) {
  const hasActiveOrder = Boolean(activeOrderForRider(db, rider.id));
  const isElectric = rider.vehicleType === 'electric_bike';
  const VehicleIcon = isElectric ? Zap : Fuel;

  const handleLogout = async () => {
    try {
      await setRiderStatus(rider.id, 'offline');
    } catch {
      // still log out on this device
    }
    logout('rider');
    navigate('/rider');
  };

  const rows = [
    { icon: Phone, label: 'Phone', value: rider.phone },
    { icon: Mail, label: 'Email', value: rider.email || '—' },
    { icon: CreditCard, label: 'CNIC', value: maskCnic(rider.cnic) },
    { icon: VehicleIcon, label: 'Vehicle', value: `${isElectric ? 'Electric Bike' : 'Petrol Bike'} · ${rider.vehiclePlate}` },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-heading font-black text-slate-900">Profile</h1>

      <div className="bg-[#06152B] text-white rounded-3xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-heading font-black shrink-0">
          {rider.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-heading font-black truncate">{rider.name}</div>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {Number(rider.rating).toFixed(1)}
            </span>
            <span>{rider.totalDeliveries} deliveries</span>
          </div>
        </div>
      </div>

      <Card>
        <ul className="divide-y divide-slate-100 zg-stagger">
          {rows.map(({ icon: Icon, label, value }) => (
            <li key={label} className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-400">{label}</div>
                <div className="text-sm font-semibold text-slate-900 truncate">{value}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Button variant="danger" className="w-full" onClick={handleLogout} disabled={hasActiveOrder}>
        <LogOut className="w-4 h-4" />
        <span>Log out</span>
      </Button>
      {hasActiveOrder && <p className="text-[11px] text-slate-500 text-center">Finish your current delivery before logging out.</p>}
    </div>
  );
}
