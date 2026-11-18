# ZipGo Portal ↔ Backend

The portals talk to the backend in the `zipgo-backend` folder.

- **API mode:** `.env.local` in the website folder contains
  `VITE_API_URL=http://localhost:4000` (already set up on this computer). For the live
  site, set `VITE_API_URL` to your API address in Vercel → Project → Settings → Environment Variables.

All server calls are in `data/store.js` (each function talks to the API) and `data/api.js` (HTTP + WebSocket). The full list of endpoints and live
events is in `zipgo-backend/README.md`.

Map services (address search, routes) go through the backend when someone is logged
in (`data/geo.js`). The public customer tracking page is `/track/<code>` (`track/TrackPage.jsx`).
