# NombaFlow — Environment Variables Reference

**Purpose:** The Backend Developer sets these up on Day 1 across all three services.

**Rule:** Never commit `.env` files to Git. The `.gitignore` already excludes them. All production and staging values live in Railway and Vercel's encrypted environment variable storage, not in any file.

---

## 1. How to Set These Up

### Local Development

Each service has its own `.env.local` file in its root directory. Copy the template below for each service, fill in the values, and you are ready.

```bash
# Frontend (Next.js) — apps/web/.env.local
# Backend (NestJS) — apps/api/.env
# AI Service (FastAPI) — apps/ai-service/.env
```

### Staging and Production

- **Backend and AI service:** set in Railway dashboard → your project → Variables tab → select the service
- **Frontend:** set in Vercel dashboard → your project → Settings → Environment Variables

Set all variables for both `staging` and `production` environments on Day 1, not on Day 3 during deployment.

---

## 2. Frontend Variables (Next.js)

File: `apps/web/.env.local`

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# JWT signing secret (must match backend JWT_SECRET)
JWT_SECRET=generate_with_openssl_rand_base64_32

# PostHog analytics (optional, add if time allows)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**How to generate JWT_SECRET:**
```bash
openssl rand -base64 32
```
Run this once. Use the **same value** in `apps/api/.env` and `apps/web/.env.local`.

Copy from template: `cp apps/web/.env.example apps/web/.env.local`

---

## 3. Backend Variables (NestJS)

File: `apps/api/.env`

```env
# Server
NODE_ENV=development
PORT=3001

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/nombaflow?sslmode=require

# Redis (Upstash)
REDIS_URL=redis://default:xxxxxxxxxxxx@us1-xxxx.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://us1-xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxx

# JWT (merchant auth — see Architecture ADR-002)
JWT_SECRET=same_value_as_frontend
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Nomba API (merchant keys are stored per-merchant in DB, this is the platform key if needed)
NOMBA_BASE_URL=https://api.nomba.com/v1
NOMBA_WEBHOOK_SECRET=the_secret_you_set_in_nomba_dashboard_for_webhooks

# Resend (email notifications)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_ADDRESS=billing@nombaflow.com

# AI Service (internal)
AI_SERVICE_URL=http://localhost:8000

# Frontend URL (for redirect URLs in checkout flows)
FRONTEND_URL=http://localhost:3000

# Encryption key for storing Nomba OAuth credentials at rest (clientSecret, tokens)
ENCRYPTION_KEY=generate_with_openssl_rand_hex_32

# Sentry (error tracking — add when deploying, optional locally)
SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/0
```

**How to generate ENCRYPTION_KEY:**
```bash
openssl rand -hex 32
```
This key encrypts merchant Nomba OAuth credentials (`clientSecret`, `accessToken`, `refreshToken`) before storing them in the database. If this key is lost, all stored credentials become unreadable. Store it safely in the team password manager.

Copy from template: `cp apps/api/.env.example apps/api/.env`

**Where to get DATABASE_URL:** Neon dashboard → your project → Connection Details → copy the connection string. Use the pooled connection string for production.

**Where to get REDIS_URL:** Upstash dashboard → your database → Details → copy the Redis URL.

**NOMBA_WEBHOOK_SECRET:** this is a secret string you define and then register in the Nomba developer dashboard as the webhook signing secret. Make it at least 32 characters. Use:
```bash
openssl rand -hex 24
```

---

## 4. AI Service Variables (FastAPI)

File: `apps/ai-service/.env`

```env
# Server
PORT=8000
ENVIRONMENT=development

# Database (same Neon instance, read access for fetching customer history)
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/nombaflow?sslmode=require

# Anthropic API (for Claude Haiku natural language insights)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx

# Internal auth token (backend uses this to authenticate calls to the AI service)
AI_SERVICE_SECRET=generate_a_random_string_shared_with_backend

# Model storage path (for saved scikit-learn models)
MODEL_STORAGE_PATH=./models
```

**Where to get ANTHROPIC_API_KEY:** Anthropic Console → API Keys → Create Key. This is used only for the natural language insights feature (Claude Haiku). The dunning and forecast models run locally with no external API calls.

**AI_SERVICE_SECRET:** a shared secret between the NestJS backend and the FastAPI service. The backend sends this in an `X-Internal-Secret` header on every call to the AI service. The AI service rejects any request that does not include the correct value. Generate it with:
```bash
openssl rand -hex 20
```
Set the same value in both the backend and AI service `.env` files.

---

## 5. Production Values (Railway and Vercel)

When deploying to production, these values change. Update them in the respective platform dashboards.

| Variable | Development Value | Production Change |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Railway backend URL |
| `DATABASE_URL` | Local or Neon dev branch | Neon production branch connection string |
| `REDIS_URL` | Upstash dev database | Same Upstash instance is fine for hackathon |
| `AI_SERVICE_URL` | `http://localhost:8000` | Railway AI service URL |
| `FRONTEND_URL` | `http://localhost:3000` | Vercel production URL |
| `NODE_ENV` | `development` | `production` |

---

## 6. Variable Checklist for Day 1

The Backend Developer goes through this list before the team starts writing feature code.

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` set
- [ ] `JWT_SECRET` generated and matches backend

### Backend
- [ ] `DATABASE_URL` from Neon, connection tested (`pnpm exec prisma db push` succeeds from `packages/database`)
- [ ] `REDIS_URL` from Upstash, connection tested (BullMQ queue connects)
- [ ] `JWT_SECRET` matches frontend value
- [ ] `NOMBA_WEBHOOK_SECRET` set and registered in Nomba dashboard
- [ ] `RESEND_API_KEY` set
- [ ] `ENCRYPTION_KEY` generated and saved in team password manager
- [ ] `AI_SERVICE_URL` set
- [ ] `FRONTEND_URL` set

### AI Service
- [ ] `DATABASE_URL` set (can reuse backend value)
- [ ] `ANTHROPIC_API_KEY` set
- [ ] `AI_SERVICE_SECRET` generated and same value set in backend

---

## 7. Secrets the Team Should Never Share Publicly

- `JWT_SECRET` — compromises all user sessions
- `ENCRYPTION_KEY` — compromises all stored Nomba merchant keys
- `NOMBA_WEBHOOK_SECRET` — allows webhook spoofing
- `ANTHROPIC_API_KEY` — exposes Anthropic billing to abuse
- `AI_SERVICE_SECRET` — allows unauthorized calls to the AI service
- Any merchant's Nomba OAuth credentials (`clientId`, `clientSecret`, `accountId`) — these are their payment credentials

These live only in the team password manager and Railway/Vercel dashboards. Not in Slack. Not in screenshots. Not in the GitHub repo.

---

## 8. Checking for Leaked Secrets Before Submission

Run this before submitting the GitHub repo:

```bash
# Install git-secrets or truffleHog
pip install truffleHog

# Scan the entire repo history
truffleHog git file://. --only-verified

# Also manually check
grep -r "sk-ant" . --exclude-dir=node_modules
grep -r "sk_test" . --exclude-dir=node_modules
grep -r "re_" . --exclude-dir=node_modules
```

If any secrets are found in the repo history, rotate them immediately before they are used by anyone who clones the repo.
