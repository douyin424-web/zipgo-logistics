import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import App from './App.jsx';
import { usePath } from './portal/router';

// The two portals load only when someone opens them, so the landing page stays fast
const BusinessPortal = lazy(() => import('./portal/business/BusinessPortal.jsx'));
const RiderPortal = lazy(() => import('./portal/rider/RiderPortal.jsx'));
const TrackPage = lazy(() => import('./portal/track/TrackPage.jsx'));

function PortalLoading() {
  return (
    <div className="min-h-screen bg-[#030C19] flex items-center justify-center text-blue-400">
      <Loader2 className="w-8 h-8 animate-spin" aria-label="Loading" />
    </div>
  );
}

export default function Root() {
  const path = usePath();

  if (path === '/business' || path.startsWith('/business/')) {
    return (
      <Suspense fallback={<PortalLoading />}>
        <BusinessPortal />
      </Suspense>
    );
  }

  if (path.startsWith('/track/')) {
    return (
      <Suspense fallback={<PortalLoading />}>
        <TrackPage code={decodeURIComponent(path.split('/')[2] || '')} />
      </Suspense>
    );
  }

  if (path === '/rider' || path.startsWith('/rider/')) {
    return (
      <Suspense fallback={<PortalLoading />}>
        <RiderPortal />
      </Suspense>
    );
  }

  return <App />;
}
