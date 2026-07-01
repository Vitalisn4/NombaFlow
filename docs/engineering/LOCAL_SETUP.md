# NombaFlow — Local Development Setup

**Goal:** Every team member can run all three services locally on Day 1.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 22 LTS | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` |
| Python | 3.13 | `pyenv install 3.13` or system package |
| Docker | 24+ | Optional — for local Redis if not using Upstash |
| Git | 2.x | System package |

## Day 1 accounts (all free tier)

Create these before writing feature code:

1. **Neon** — PostgreSQL database → copy `DATABASE_URL`
2. **Upstash** — Redis → copy `REDIS_URL`
3. **Nomba** — [Developer dashboard](https://developer.nomba.com/docs/getting-started/get-api-keys) → `client_id`, `client_secret`, `accountId`
4. **Resend** — API key for transactional email
5. **Anthropic** — API key for NL insights (AI specialist)
6. **Vercel** — link frontend repo
7. **Railway** — deploy backend + AI service

**No Nomba account yet?** Use [Try the API](https://developer.nomba.com/docs/guides/try-the-api) to test Transfer, Virtual Account, and Checkout in sandbox without credentials.

## Repository setup

```bash
git clone git@github.com:Vitalisn4/NombaFlow.git
cd NombaFlow
git checkout develop
corepack enable
pnpm install   # from repo root — installs all workspace packages
```

Issue #1 (monorepo init) is **complete** on `main`. Continue with Issues #2–#4 on GitHub for full app tooling.

**Package manager rule:** use **pnpm only** — do not use npm or yarn in this repo. Commit `pnpm-lock.yaml`.

## Environment files

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/ai-service/.env.example apps/ai-service/.env
```

Full reference: [Environment Variables](./NombaFlow_Env_Variables.md)

Generate secrets:

```bash
openssl rand -base64 32   # JWT_SECRET (same in web + api)
openssl rand -hex 32      # ENCRYPTION_KEY
openssl rand -hex 20      # AI_SERVICE_SECRET (same in api + ai-service)
```

## Run services

### Database

```bash
cd packages/database
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
pnpm exec prisma db seed   # after seed file exists (Day 3)
```

Or from repo root: `pnpm --filter @nombaflow/database exec prisma migrate dev --name init`

### Backend (NestJS)

```bash
# From repo root (recommended)
pnpm --filter @nombaflow/api start:dev

# Or from app directory
cd apps/api && pnpm start:dev
# Health check: GET http://localhost:3001/health
```

### AI service (FastAPI)

```bash
cd apps/ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Health check: GET http://localhost:8000/health
```

### Frontend (Next.js)

```bash
# From repo root (recommended)
pnpm --filter @nombaflow/web dev

# Or from app directory
cd apps/web && pnpm dev
# Open http://localhost:3000
```

## Nomba sandbox testing

1. Register webhook URL: `https://your-railway-url/webhooks/nomba` (use ngrok locally: `ngrok http 3001`)
2. Subscribe to: `payment_success`, `payment_failed`, `payout_success`, `payout_failed`
3. Set webhook signature key → copy to `NOMBA_WEBHOOK_SECRET`
4. Use [sandbox test cards](https://developer.nomba.com/docs/api-basics/testing) for checkout flows
5. Sandbox limits: max 2 virtual accounts per user; transfers capped at ₦150

## Common issues

| Problem | Fix |
|---|---|
| Nomba returns `code !== "00"` | Check `accountId` header, token expiry, credential validity |
| Webhooks not arriving | Confirm public URL, event subscription, and 200 response |
| Prisma client not found | Run `pnpm exec prisma generate` from `packages/database` |
| CORS errors | Set `FRONTEND_URL` in backend `.env` to match Next.js origin |

## Useful links

- [Nomba docs index](https://developer.nomba.com/llms.txt)
- [Nomba API Verified guide](./NombaFlow_Nomba_API_Verified.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
