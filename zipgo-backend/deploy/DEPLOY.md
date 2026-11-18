# ZipGo backend ko live karna (Oracle Database + Cloudflare)

Poora raasta:

```
Customer / Rider / Business  →  website (Vercel)  →  https://api.aapka-domain.com
                                                        │  (Cloudflare: free HTTPS)
                                                        ▼
                                              Cloudflare Tunnel  →  Server (Docker: ZipGo API)
                                                                        │
                                                                        ▼
                                                           Oracle Autonomous Database
```

Aap ko 4 cheezein chahiye: **Oracle Cloud account** (database), **ek Linux server**, **Cloudflare** (domain jis par HTTPS aur tunnel lagta hai), aur **Vercel** (website, pehle se hai).

> Passwords aur `.env.production` file kabhi chat, email ya git mein na bhejein.

---

## Pehle ek zaroori faisla: server kahan?

| Option | Kharcha | Kab theek hai |
| --- | --- | --- |
| **Sasta VPS** (Hetzner, DigitalOcean, Contabo wagaira, Ubuntu 22.04/24.04, kam az kam 1 GB RAM) | lagbhag 4 se 6 dollar mahina | **Asli chalte hue business ke liye yehi behtar hai.** Server band ya wapas nahi liya jata. |
| **Oracle Cloud Always Free VM** | free | Test ya shuru ke liye. Oracle bohat kam istemal hone wale free VM wapas le sakta hai (7 din tak CPU 20% se kam rahe to), aur kabhi kabhi "out of host capacity" ka error aata hai. [Oracle ki shartein](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm) |

Database ke liye Oracle ka **Always Free Autonomous Database** (1 CPU, 20 GB, 20 sessions) is app ke liye kaafi hai. Live karne se pehle Oracle ki free-tier ki shartein ek baar khud padh lein (khaas tor par database ke band hone ke qaide).

---

## Step 1 — Oracle Database banayen

1. [cloud.oracle.com](https://cloud.oracle.com) par account banayen (card verification maangta hai).
2. Menu → **Oracle Database → Autonomous Database → Create Autonomous Database**.
   - Workload type: **Transaction Processing**
   - Deployment: **Serverless**, **Always Free** ka switch on
   - ADMIN ka password likh kar mehfooz rakhein
   - Network access: **Secure access from everywhere**
3. Database bani ho to **Database actions → SQL** kholein, ADMIN ke taur par `deploy/create-user-autonomous.sql` chalayen (pehle us mein password badal lein). Is se `zipgo` user ban jata hai.
4. Database ke page par **Database connection** dabayen:
   - **Easy tareeqa (wallet ke baghair):** pehle "Mutual TLS (mTLS) authentication" ki zaroorat band karein (Edit → "Mutual TLS authentication" ko **Not required** karen), phir "Connection strings" mein **TLS** wali `high` ya `low` string copy karein. Yehi `ORACLE_CONNECT_STRING` banegi.
   - **Wallet wala tareeqa:** "Download wallet" karein, zip ko khol kar uski files server ke `deploy/wallet/` folder mein rakhein, aur `ORACLE_WALLET_DIR=/app/wallet` aur wallet ka password `.env.production` mein likhein.

Tables khud ban jayenge. Backend pehli baar chalte hi schema bana leta hai.

## Step 2 — Server tayyar karein

Server par (Ubuntu) yeh chalayen:

```bash
curl -fsSL https://get.docker.com | sh
```

Phir `zipgo-backend` folder poora server par copy karein (`scp -r zipgo-backend user@SERVER_IP:~/` ya git se).

## Step 3 — Secrets bharein

```bash
cd ~/zipgo-backend/deploy
cp env.production.example .env.production
nano .env.production
```

- `JWT_SECRET`: `openssl rand -hex 32` ka jawab paste karein
- `CORS_ORIGINS`: website ka address, jaise `https://zipgologistics.pro,https://www.zipgologistics.pro`
- `ORACLE_USER=zipgo`, `ORACLE_PASSWORD` (Step 1 wala), `ORACLE_CONNECT_STRING` (Step 1 wali string)

## Step 4 — Cloudflare Tunnel banayen

1. [dash.cloudflare.com](https://dash.cloudflare.com) mein login karein (domain wahan add hona chahiye).
2. **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**. Naam: `zipgo-api`.
3. Jo **token** dikhe (lamba text), use `.env.production` mein `TUNNEL_TOKEN=` ke baad paste karein.
4. **Public hostname** tab mein: subdomain `api`, apna domain, Service type **HTTP**, URL **`api:4000`**.

Cloudflare khud DNS aur HTTPS lagata hai. WebSocket (live tracking) bhi isi se chalta hai.

## Step 5 — Chalayen

```bash
cd ~/zipgo-backend/deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

Logs mein yeh line aani chahiye: `ZipGo API running ... (database: oracle, production)`.

Phir browser mein kholein: `https://api.aapka-domain.com/health`. Jawab `"status":"ok","database":"oracle"` aana chahiye.

> **Sirf ek api container chalayen.** Dispatch ki halat memory mein hoti hai, do copies se orders ghalat bat jayenge.

## Step 6 — Website ko backend se jodein

Vercel → Project → Settings → Environment Variables:

```
VITE_API_URL = https://api.aapka-domain.com
```

Phir **Redeploy** karein. Website ab live backend se baat karegi.

## Step 7 — Asli WhatsApp code

`.env.production` mein `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` aur template ka naam bharein (Meta wali settings pehle bata di thi), phir:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Production mein koi test code (123456) kaam nahi karta. Jab tak WhatsApp theek na ho, koi login nahi kar sakega.

---

## Update karna

```bash
cd ~/zipgo-backend && git pull   # ya nayi files copy karein
cd deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Aam masle

| Nishani | Wajah aur hal |
| --- | --- |
| `ORA-01017` | Oracle user ya password ghalat |
| `ORA-12170` / timeout | Database tak rasta nahi. Network access "Secure access from everywhere" karein, aur connect string dobara copy karein |
| `ORA-28759` wallet ka error | Wallet ki files `deploy/wallet/` mein nahi, ya password ghalat |
| Website par CORS ka error | `CORS_ORIGINS` mein website ka bilkul sahi address nahi (https, bina aakhri `/`) |
| `https://api…/health` par 502 | api container chal nahi raha: `docker compose ... logs api` dekhein |
| Server start hi nahi hota "JWT_SECRET" | `JWT_SECRET` 32 se kam huroof ka hai |
| Live tracking nahi chalti | Tunnel ka Service URL `api:4000` (HTTP) hona chahiye |

## Backup

Autonomous Database apni backups khud leta hai. Is ke ilawa `.env.production` ki ek mehfooz copy (password manager mein) rakhein.
