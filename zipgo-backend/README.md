# ZipGo Backend

The server behind the ZipGo **Business Portal** and **Rider Portal**: WhatsApp login,
orders, automatic rider dispatch, live tracking, earnings and menu items.
Data is stored in **Oracle Database**.

Built with plain Node.js. It needs only two packages: `oracledb` (Oracle driver,
no Oracle Instant Client needed) and `ws` (live updates).

## Quick start on this computer

Double-click **`start-zipgo.bat`** in the website folder (`ipgo`). It installs the
packages the first time, starts the backend (port 4000) and the website (port 5173),
and opens both portals. The login code while testing is `123456`.

On the first run it creates the settings files: `zipgo-backend/.env` (from
`local.env.template` — local database file for now, a random `JWT_SECRET`, and the
`WHATSAPP_*` lines from the old map backend's `.env` if present) and `ipgo/.env.local`
(points the website to `http://localhost:4000`). Edit them any time; delete them to
start fresh.
Close the old map backend (`indrive-backend-geospatial`) first — it also uses port 4000.
Everything it did now lives in this backend.

## 1. What you need

- Node.js **22.5 or newer** — check with `node -v`
- An Oracle Database: your own server, Oracle Autonomous Database (cloud), or the
  free local one from `docker-compose.yml`

## 2. Set up the database

**Option A — free local Oracle with Docker (easiest)**

```bash
docker compose up -d oracle
```

Wait until `docker compose ps` shows the database as `healthy` (a few minutes the
first time). The user `zipgo` is created for you; the connect string is
`localhost:1521/FREEPDB1`.

**Option B — your own Oracle server**

Ask your DBA (or run as SYSTEM) the script `sql/create-user.sql` to create a `zipgo`
user. The tables are created automatically when the API starts. If you prefer to
create them by hand, run `sql/oracle-schema.sql` as the `zipgo` user and set
`DB_AUTO_MIGRATE=false`.

**Option C — Oracle Autonomous Database (cloud)**

Download the wallet zip from the Oracle Cloud console, unzip it into a folder, and
set `ORACLE_WALLET_DIR` (and `ORACLE_WALLET_PASSWORD`) in `.env`. Use one of the
service names from `tnsnames.ora` (for example `zipgo_high`) as
`ORACLE_CONNECT_STRING`.

## 3. Configure and start

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING, JWT_SECRET
npm run dev
```

Open http://localhost:4000/health — you should see `"status":"ok"` and `"database":"oracle"`.

**Try it without Oracle:** `npm run dev:sqlite` stores everything in a local file
(`data/zipgo-dev.sqlite`). Good for testing, not for real use.

## 4. Connect the portals

In the website folder (`ipgo`), create a file named `.env.local` with:

```
VITE_API_URL=http://localhost:4000
```

Restart `npm run dev` there. The portals at `/business` and `/rider` now use this
backend instead of demo mode. In development the login code is shown on screen
(`OTP_DEV_CODE`, default `123456`).

## 5. WhatsApp login codes

1. In Meta Business / WhatsApp Manager, set up a WhatsApp Business phone number.
2. Create a message template of category **Authentication** with a
   **copy code** button. Its body has one variable: the code.
3. Put the values in `.env`: `WHATSAPP_TOKEN` (a permanent system-user token),
   `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANG`.

Until your template is approved you can set `WHATSAPP_MESSAGE_TYPE=text` (a plain
message — it only reaches test numbers and people who messaged your WhatsApp number
in the last 24 hours).

The webhook moved here from the old map backend: in Meta, point it to
`https://<your-api>/api/v1/webhooks/whatsapp` with the same `WHATSAPP_VERIFY_TOKEN`.
Set `WHATSAPP_APP_SECRET` so fake webhook calls are rejected.

Without these, codes are only printed in the server console (development only).
In production the server refuses to log anyone in until WhatsApp is configured,
and `OTP_DEV_CODE` is ignored.

## 6. Going live (checklist)

- `NODE_ENV=production`
- `JWT_SECRET` = a long random value (the server will not start without one)
- `CORS_ORIGINS=https://zipgologistics.pro` (your real website address)
- WhatsApp settings filled in
- Run behind HTTPS (for example Nginx or Caddy in front of port 4000) so the
  WebSocket works as `wss://`
- Run **one** server process (`npm start`, or `docker build` with the included
  `Dockerfile`). Dispatch timers live in memory; pending orders are picked up
  again after a restart.
- For real traffic, host your own OSRM routing server and set `OSRM_URL` — the
  free public one is rate limited. If it cannot be reached, distance is estimated.
- Back up the Oracle database.

## How it works

| Rule | Setting in `.env` |
| --- | --- |
| Fare = base + per km, × peak multiplier in peak hours | `BASE_FARE=80`, `PER_KM_RATE=25`, `PEAK_MULTIPLIER=1.3`, `PEAK_HOURS=12-15,19-22` |
| New order goes to online, free riders within this distance | `DISPATCH_RADIUS_KM=10` |
| Nobody accepts in time → sent to every online rider | `OFFER_SECONDS=30` |
| This many declines → order failed | `MAX_DECLINES=3` |
| Nobody accepts at all → order failed | `PENDING_TIMEOUT_SECONDS=120` |
| Pickup and dropoff must be inside the service area | `SERVICE_CENTER_LAT/LNG`, `SERVICE_RADIUS_KM=60` |

The fare is always calculated on the server, so nobody can change the price from
their browser. The customer's phone number is only shown to the rider after they
accept the order. The first rider to press Accept gets the order — the database
update makes sure two riders can never both get it.

## API

All routes start with `/api/v1`. Send `Authorization: Bearer <token>` after login.
Responses look like `{ "success": true, "data": ... }` or
`{ "success": false, "error": { "message": "..." } }`.

| Method | Path | Who | What |
| --- | --- | --- | --- |
| POST | `/auth/request-otp` | anyone | `{ phone, role }` → sends the WhatsApp code |
| POST | `/auth/verify-otp` | anyone | `{ phone, role, code }` → `token` (existing account) or `registrationToken` (new) |
| GET | `/auth/me` | logged in | current account |
| POST | `/business/register` | registration token | business details + map location → `token` |
| GET/PUT | `/business/me` | business | profile |
| GET | `/business/dashboard` | business | today's orders, in progress, delivered, spend |
| GET/POST | `/business/menu` | business | list / add menu item |
| PATCH/DELETE | `/business/menu/:id` | business | update (`inStock`) / remove |
| POST | `/business/support` | business | `{ message }` → support ticket |
| POST | `/pricing/estimate` | business | `{ drop: { lat, lng } }` → distance, time, fare |
| GET | `/pricing/rules` | anyone | current fare rules |
| POST | `/orders` | business | create order (server sets fare and dispatches) |
| GET | `/orders` | business | your orders + their riders |
| GET | `/orders/:id` | owner or rider | order + rider location |
| POST | `/orders/:id/cancel` | business | only while no rider has accepted |
| POST | `/riders/register` | registration token | name, CNIC, vehicle → `token` |
| GET | `/riders/me` | rider | profile |
| PUT | `/riders/status` | rider | `{ status: online / offline, lat?, lng? }` |
| PUT | `/riders/location` | rider | `{ lat, lng }` (fallback; normally sent over WebSocket) |
| GET | `/riders/requests` | rider | delivery requests waiting for you |
| GET | `/riders/orders` | rider | your orders |
| GET | `/riders/earnings` | rider | today / 7 days / 30 days |
| POST | `/orders/:id/accept` | rider | first rider wins |
| POST | `/orders/:id/decline` | rider | `{ reason: declined / timeout }` |
| POST | `/orders/:id/status` | rider | `picked_up` → `in_transit` → `delivered` (or `failed` with `reason`) |

| GET | `/geo/search?q=` | logged in | address search near Lahore (cached, Nominatim) |
| GET | `/geo/reverse?lat=&lng=` | logged in | address of a map point |
| GET | `/geo/route?from=lat,lng&to=lat,lng` | logged in | road route line, distance, time (cached, OSRM) |
| GET | `/geo/riders-nearby` | business | online riders around your shop (positions only) |
| GET | `/track/:code` | anyone with the link | customer tracking: status, rider location, ETA |
| GET/POST | `/webhooks/whatsapp` | Meta | WhatsApp webhook (verify token + signature check) |

**Customer tracking link:** every order gets a secret link
`https://<website>/track/<code>`. The business copies it or sends it on WhatsApp
from Live Tracking. The customer sees the rider moving on the map without logging
in. Phone numbers of the shop and the customer are never shown; the rider's number
only while the delivery is active. Links stop working 24 hours after the order ends.

**Live updates:** connect a WebSocket to `/ws?token=<token>`. Messages are
`{ "event": "...", "data": {...} }`.

- Business receives `order:updated` and `rider:location`
- Rider receives `order:new-request`, `order:withdrawn`, `order:updated`, `rider:status`
- Rider sends `rider:location` `{ lat, lng, heading }` every few seconds

## Tests

```bash
npm test
```

Runs the whole flow (sign-up, dispatch, accept race, tracking, delivery, earnings,
cancel, 3 declines, timeout) against a temporary in-memory database.

## Folder layout

```
src/
  server.js          starts everything
  config.js          reads .env
  db/                Oracle + SQLite adapters, table definitions
  repos/             SQL queries
  routes/            API endpoints
  services/          dispatch, live updates, login tokens
  lib/               small helpers (HTTP, JWT, validation, fares, WhatsApp)
sql/                 SQL scripts for your DBA
test/                automated tests
```
