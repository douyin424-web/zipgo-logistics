import React, { useEffect } from 'react';
import { Home, ClipboardList, Wallet, User, Loader2 } from 'lucide-react';
import { Link, usePath } from '../router';
import { BrandLogo } from '../components/ui';
import { useDb, useSessionId, startSync } from '../data/store';
import RiderAuth from './RiderAuth';
import RiderHome from './RiderHome';
import { RiderOrders, RiderEarnings, RiderProfile } from './RiderMisc';

const TABS = [
  { path: '/rider', label: 'Home', icon: Home },
  { path: '/rider/orders', label: 'Orders', icon: ClipboardList },
  { path: '/rider/earnings', label: 'Earnings', icon: Wallet },
  { path: '/rider/profile', label: 'Profile', icon: User },
];

export default function RiderPortal() {
  const path = usePath();
  const db = useDb();
  const sessionId = useSessionId('rider');
  const rider = sessionId ? db.riders[sessionId] : null;

  // Live data from the server 
  useEffect(() => (sessionId ? startSync('rider') : undefined), [sessionId]);

  if (sessionId && !rider) {
    return (
      <div className="min-h-screen bg-[#030C19] flex items-center justify-center text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" aria-label="Loading your account" />
      </div>
    );
  }
  if (!rider) return <RiderAuth />;

  const section = path.split('/')[2] || '';
  const isActive = (tabPath) => (tabPath === '/rider' ? section === '' : path.startsWith(tabPath));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-[#030C19] text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <BrandLogo subtitle="Rider Portal" />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${rider.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">{rider.name}</span>
            <span className="hidden sm:inline text-[11px] font-bold text-slate-500">· {rider.status === 'online' ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 lg:flex lg:gap-6">
        {/* Desktop: side menu */}
        <nav aria-label="Rider portal" className="hidden lg:block lg:w-56 shrink-0">
          <div className="flex flex-col gap-2 sticky top-24">
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

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          {/* Home stays mounted so the rider keeps receiving requests on every tab */}
          <RiderHome db={db} rider={rider} visible={section === ''} />
          {section !== '' && (
            <div key={section} className="max-w-3xl zg-page">
              {section === 'orders' && <RiderOrders db={db} rider={rider} />}
              {section === 'earnings' && <RiderEarnings db={db} rider={rider} />}
              {section === 'profile' && <RiderProfile db={db} rider={rider} />}
            </div>
          )}
        </main>
      </div>

      {/* Phones: bottom menu */}
      <nav aria-label="Rider portal" className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {TABS.map(({ path: tabPath, label, icon: Icon }) => (
            <Link
              key={tabPath}
              to={tabPath}
              aria-current={isActive(tabPath) ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${
                isActive(tabPath) ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
