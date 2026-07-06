# NombaFlow

**Managed recurring billing engine on Nomba** — built for the [Nomba × DevCareer Hackathon 2026](https://devcareer.io).

**Repository:** https://github.com/Vitalisn4/NombaFlow  
**Active branch:** `develop` (feature work) · `main` (protected, merge via PR)

NombaFlow gives Nigerian businesses a subscriptions layer on top of Nomba's payment primitives: plan management, tokenized card billing, AI-powered dunning, customer self-service, and ajo/esusu group automation.

**Hackathon track:** Infrastructure — Subscriptions Engine

## Team

| Role | Focus |
|---|---|
| Backend Developer | NestJS API, Prisma, Nomba integration, billing engine, webhooks, emails, deployment |
| Full Stack Developer | Next.js UI, auth session/cookies, dashboard, enrollment flows, demo polish |
| AI Specialist | FastAPI service, dunning model, forecast, churn, NL insights |

## Quick start

All documentation lives in [`/docs`](./docs/README.md). Start here:

0. [Team Onboarding](./docs/ONBOARDING.md) — Day 0 setup and first issues
1. [Nomba API Verified Guide](./docs/engineering/NombaFlow_Nomba_API_Verified.md) — **read first** before any Nomba code
2. [Database Schema](./docs/engineering/NombaFlow_Database_Schema.md)
3. [API Contract](./docs/engineering/NombaFlow_API_Contract_v2.md)
4. [GitHub Issues](https://github.com/Vitalisn4/NombaFlow/issues) — pick up assigned work
5. [Local Setup Guide](./docs/engineering/LOCAL_SETUP.md)

## Tech stack ($0 to start)

**Package manager:** pnpm 9 (monorepo workspaces)

| Layer | Technology | Free tier |
|---|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind v4, shadcn/ui | Vercel |
| Backend | NestJS 11, Node.js, Prisma 7 | Railway |
| AI | Python 3.13, FastAPI, LightGBM, Claude Haiku | Railway + Anthropic free credits |
| Database | PostgreSQL 17 | Neon |
| Cache/Queue | Redis, BullMQ | Upstash |
| Email | Resend | 3,000 emails/month free |
| Monitoring | Sentry | Free developer tier |

## Nomba APIs used

- [OAuth 2.0 authentication](https://developer.nomba.com/docs/getting-started/authentication)
- [Checkout + card tokenization](https://developer.nomba.com/docs/products/accept-payment/create-checkout-order)
- [Tokenized card charges](https://developer.nomba.com/docs/products/accept-payment/recurring-payments)
- [Webhooks](https://developer.nomba.com/docs/api-basics/webhook) (`payment_success`, `payment_failed`, `payout_success`, `payout_failed`)
- [Bank transfers](https://developer.nomba.com/nomba-api-reference/transfers/perform-bank-account-transfer-from-the-parent-account) (ajo payouts)
- [Virtual accounts](https://developer.nomba.com/docs/products/accept-payment/virtual-account) (optional, future)

## Repository structure

```
nombaflow/
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   ├── web/          # Next.js — GitHub #9 for full Tailwind/shadcn setup
│   ├── api/          # NestJS — health check at GET /health
│   └── ai-service/   # FastAPI — health check at GET /health
├── packages/
│   ├── database/     # Prisma schema (authoritative)
│   └── types/        # Shared TypeScript types
└── docs/
```

### Quick commands

```bash
corepack enable && pnpm install
pnpm dev:web          # http://localhost:3000
pnpm dev:api          # http://localhost:3001/health
cd apps/ai-service && uvicorn main:app --reload --port 8000
```

## License

Hackathon submission — license TBD.
