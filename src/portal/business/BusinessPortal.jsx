import React, { useEffect, useState } from 'react';
import { LayoutDashboard, PackagePlus, ClipboardList, MapPin, Wallet, Tag, LifeBuoy, LogOut, ArrowRight, Package, Bike, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, usePath, navigate } from '../router';
import { BrandLogo, Card, StatusBadge, EmptyState, formatPKR, formatDateTime } from '../components/ui';
import { useDb, useSessionId, logout, startSync, fetchNearbyRiders, ordersForBusiness, isToday, ACTIVE_STATUSES } from '../data/store';
import MapView from '../components/MapView';
import BusinessAuth from './BusinessAuth';
import NewOrder from './NewOrder';
import { OrdersList, LiveTracking } from './BusinessOrders';
import { Spend, MenuItems, Support } from './BusinessMisc';

const TABS = [
  { path: '/business', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/business/new-order', label: 'New Order', icon: PackagePlus },
  { path: '/business/orders', label: 'Orders', icon: ClipboardList },
  { path: '/business/tracking', label: 'Live Tracking', icon: MapPin },
  { path: '/business/earnings', label: 'Earnings', icon: Wallet },
  { path: '/business/menu', label: 'Menu Items', icon: Tag },
  { path: '/business/support', label: 'Support', icon: LifeBuoy },
];

// Live count + map of online riders around the business
function NearbyRiders({ business }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchNearbyRiders(business)
        .then((result) => {
          if (!cancelled) setData(result);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [business.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const riders = data ? data.riders : [];
  const markers = [
    { id: 'shop', type: 'pickup', lat: business.lat, lng: business.lng, label: business.businessName },
    ...riders.map((r, i) => ({ id: `r${i}`, type: 'rider', lat: r.lat, lng: r.lng, label: r.available ? 'Available rider' : 'Rider on a delivery' })),
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-heading font-bold text-slate-900">Riders near you</h2>
          <p className="text-xs text-slate-500">Online within {data ? data.radiusKm : 10} km · updates every 20 seconds</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">{data ? data.available : '…'} available</span>
        </div>
      </div>
      <MapView className="h-56" markers={markers} fitKey={`${business.id}:${riders.length}`} />
    </Card>
  );
}

function Overview({ business, orders }) {
  const today = orders.filter((o) => isToday(o.createdAt));
  const inProgress = orders.filter((o) => o.status === 'pending' || ACTIVE_STATUSES.includes(o.status));
  const delivered = orders.filter((o) => o.status === 'delivered');
  const spent = delivered.reduce((sum, o) => sum + (o.finalFare || o.proposedFare), 0);

  const stats = [
    { label: "Today's orders", value: today.length, icon: Package },
    { label: 'In progress', value: inProgress.length, icon: Bike },
    { label: 'Delivered', value: delivered.length, icon: CheckCircle2 },
    { label: 'Total delivery spend', value: formatPKR(spent), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#06152B] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">{business.businessType}</p>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight mt-1">{business.businessName}</h1>
          <p className="text-xs text-slate-400 mt-2">{business.address}</p>
        </div>
        <Link
          to="/business/new-order"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <PackagePlus className="w-4 h-4" />
          <span>New Order</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-heading font-black text-slate-900 mt-3">{value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      <NearbyRiders business={business} />

      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-heading font-bold text-slate-900">Recent orders</h2>
          <Link to="/business/orders" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" text="Create your first delivery order and a nearby rider will be notified right away." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link to={`/business/tracking/${o.id}`} className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-slate-900">{o.orderNumber}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {o.dropName} · {formatDateTime(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-900 hidden sm:inline">{formatPKR(o.proposedFare)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function BusinessPortal() {
  const path = usePath();
  const db = useDb();
  const sessionId = useSessionId('business');
  const business = sessionId ? db.businesses[sessionId] : null;

  // Live data from the server 
  useEffect(() => (sessionId ? startSync('business') : undefined), [sessionId]);

  if (sessionId && !business) {
    return (
      <div className="min-h-screen bg-[#030C19] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" aria-label="Loading your account" />
      </div>
    );
  }
  if (!business) return <BusinessAuth />;

  const orders = ordersForBusiness(db, business.id);
  const section = path.split('/')[2] || '';
  const param = path.split('/')[3] || '';

  const handleLogout = () => {
    logout('business');
    navigate('/business');
  };

  let content;
  if (section === 'new-order') content = <NewOrder business={business} />;
  else if (section === 'orders') content = <OrdersList orders={orders} />;
  else if (section === 'tracking') content = <LiveTracking db={db} orders={orders} selectedId={param} />;
  else if (section === 'earnings') content = <Spend orders={orders} />;
  else if (section === 'menu') content = <MenuItems db={db} business={business} />;
  else if (section === 'support') content = <Support business={business} />;
  else content = <Overview business={business} orders={orders} />;

  const isActive = (tabPath) => (tabPath === '/business' ? section === '' : path.startsWith(tabPath));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-[#030C19] text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <BrandLogo subtitle="Business Portal" />
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:block text-xs font-semibold text-slate-300 truncate max-w-[200px]">{business.businessName}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:flex lg:gap-6">
        <nav aria-label="Business portal" className="lg:w-56 shrink-0 mb-5 lg:mb-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:sticky lg:top-24">
            {TABS.map(({ path: tabPath, label, icon: Icon }) => (
              <Link
                key={tabPath}
                to={tabPath}
                aria-current={isActive(tabPath) ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive(tabPath)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          <div key={`${section}/${param}`} className="zg-page">{content}</div>
        </main>
      </div>
    </div>
  );
}
