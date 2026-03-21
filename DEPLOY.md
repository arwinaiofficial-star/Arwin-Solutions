# Arwin AI — Production Deployment Guide

## Architecture

```
User → arwinai.com (Vercel)
         ├── Static pages (Next.js SSR/SSG)
         ├── /api/jobs → Job search APIs (Adzuna, JSearch, Remotive)
         └── /api/auth/*, /api/resume/* → BFF proxy → Render (FastAPI)
                                                        ├── Neon (PostgreSQL)
                                                        └── Upstash (Redis)
```

**Cost: $0/month** (all free tiers)

---

## Step 1: Database — Neon (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project (name: `arwinai`, region: `Singapore`)
3. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Important**: Change `postgresql://` to `postgresql+asyncpg://` for our backend:
   ```
   postgresql+asyncpg://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

Save this — you'll need it in Step 3.

---

## Step 2: Redis — Upstash (Free Serverless Redis)

1. Go to [upstash.com](https://upstash.com) and create an account
2. Create a new Redis database (name: `arwinai`, region: `ap-southeast-1`)
3. Copy the **Redis URL** (TLS) — it looks like:
   ```
   rediss://default:xxxtoken@xxx.upstash.io:6379
   ```

Save this — you'll need it in Step 3.

---

## Step 3: Backend — Render (Free Docker Deploy)

1. Go to [render.com](https://render.com) and create an account
2. Click **New → Web Service**
3. Connect your GitHub repo (`Arwin-Solutions`)
4. Configure:
   - **Name**: `arwinai-backend`
   - **Region**: Singapore
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Plan**: Free

5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql+asyncpg://...` (from Step 1) |
   | `REDIS_URL` | `rediss://...` (from Step 2) |
   | `JWT_SECRET` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `CORS_ORIGINS` | `https://arwinai.com,https://www.arwinai.com` |
   | `OPENROUTER_API_KEY` | Your OpenRouter key |
   | `GROQ_API_KEY` | Your Groq key |
   | `ADZUNA_APP_ID` | Your Adzuna app ID |
   | `ADZUNA_APP_KEY` | Your Adzuna app key |
   | `JSEARCH_API_KEY` | Your JSearch key |

6. Click **Deploy** — Render will build the Docker image and run migrations automatically.

7. Your backend URL will be: `https://arwinai-backend.onrender.com`
   - Test: visit `https://arwinai-backend.onrender.com/health`

> **Note**: Render free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds. This is normal for free tier.

---

## Step 4: Frontend — Vercel (Already Set Up)

Your Vercel deployment at `arwinai.com` just needs the environment variables updated.

1. Go to [Vercel Dashboard](https://vercel.com) → your project → Settings → Environment Variables
2. Add/update these variables (for **Production** environment):

   | Key | Value |
   |-----|-------|
   | `FASTAPI_URL` | `https://arwinai-backend.onrender.com` |
   | `ADZUNA_APP_ID` | Your Adzuna app ID |
   | `ADZUNA_APP_KEY` | Your Adzuna app key |
   | `JSEARCH_API_KEY` | Your JSearch key |
   | `RESEND_API_KEY` | Your Resend key (for contact form) |
   | `CONNECT_NOTIFY_EMAIL` | `hr@arwinai.com` |
   | `NEXT_PUBLIC_APP_URL` | `https://arwinai.com` |

3. Redeploy: Go to **Deployments** tab → click **...** on latest → **Redeploy**

---

## Step 5: Verify Everything Works

1. **Homepage**: Visit `https://arwinai.com` — should load the landing page
2. **Sign up**: Go to `/jobready/signup` — create an account
3. **Resume Builder**: Go to `/jobready/dashboard` → Resume Builder tab → complete the questionnaire
4. **Job Search**: Switch to Job Search tab → search for jobs → verify "Apply Now" links work
5. **Backend Health**: Visit `https://arwinai-backend.onrender.com/health`

---

## Troubleshooting

### Backend not responding
- Check Render dashboard for build/deploy logs
- Verify `DATABASE_URL` uses `postgresql+asyncpg://` prefix (not `postgresql://`)
- Check that Neon database is awake (free tier may pause after inactivity)

### Auth not working
- Verify `FASTAPI_URL` in Vercel points to correct Render URL
- Verify `CORS_ORIGINS` on Render includes `https://arwinai.com`
- Check browser DevTools Network tab for CORS errors

### Jobs not loading
- Verify `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JSEARCH_API_KEY` are set in Vercel
- Test Adzuna: `curl "https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=YOUR_ID&app_key=YOUR_KEY&results_per_page=1&what=python"`

### Cold starts (30s delay)
- Normal for Render free tier — the service spins down after 15 min idle
- Upgrade to Render Starter ($7/mo) to keep it always-on

---

## Local Development

```bash
# Terminal 1: Start infrastructure
docker-compose up postgres redis -d

# Terminal 2: Start backend
cd backend
cp .env.example .env  # Fill in your values
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 3: Start frontend
cp .env.example .env.local  # Fill in your values
npm install
npm run dev
```

Visit `http://localhost:3000`
