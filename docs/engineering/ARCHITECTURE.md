# NombaFlow — System Architecture

**Status:** Authoritative architecture reference for implementation.  
**Supersedes:** Masterplan Part 6 (use this document instead).

---

## 1. Architecture at a glance

NombaFlow is a **modular monolith** for the hackathon: one NestJS API, one Next.js app, one FastAPI AI service. This trades microservice complexity for speed while keeping clear module boundaries for future extraction.

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT LAYER (Vercel)                                      │
│  Next.js 16 — Merchant dashboard + customer enrollment/portal │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS  /api/v1/*
┌───────────────────────────▼─────────────────────────────────┐
│  API LAYER (Railway) — NestJS 11                              │
│  Auth · Merchants · Plans · Subscriptions · Charges · Webhooks│
│  Dunning · Ajo · Notifications · Analytics                    │
└───────┬─────────────────────────────┬───────────────────────┘
        │                             │ X-Internal-Secret
        │                             ▼
        │              ┌──────────────────────────────┐
        │              │  AI SERVICE (Railway)        │
        │              │  FastAPI — dunning, forecast │
        │              └──────────────┬───────────────┘
        ▼                             │
┌───────────────┐              ┌──────▼──────┐
│ PostgreSQL    │              │ Same DB     │
│ (Neon)        │◄─────────────│ read access │
└───────────────┘              └─────────────┘
        │
┌───────▼───────┐     ┌─────────────────────┐
│ Redis/Upstash │     │ Nomba APIs          │
│ BullMQ queues │     │ OAuth · Checkout ·  │
└───────────────┘     │ Webhooks · Transfers│
                      └─────────────────────┘
```

---

## 2. Architectural decisions (ADRs)

### ADR-001: Modular monolith over microservices

| | |
|---|---|
| **Decision** | Single NestJS deployable with domain modules, not separate services per domain |
| **Why** | 3-person team, 3-day hackathon; shared DB transactions for billing state machine |
| **Trade-off** | Cannot scale modules independently yet; acceptable for MVP |
| **Future** | Extract `ai-service` already separate; billing engine could split at Series A scale |

### ADR-002: NestJS owns all merchant auth (JWT)

| | |
|---|---|
| **Decision** | `POST /auth/*` on NestJS returns JWT access + refresh tokens. Next.js stores tokens in **httpOnly cookies** via a thin API client — not Auth.js for merchant auth in hackathon MVP |
| **Why** | Single auth source of truth; API Contract already defines JWT shapes; avoids split-brain between Auth.js and NestJS |
| **Implementation** | Backend: bcrypt + `@nestjs/jwt`. Frontend: login form → API → set cookies → middleware checks session |
| **Customer portal** | Separate lightweight token (enrollment session or signed portal link) scoped to `customerId` only |

### ADR-003: Async webhook processing (always return 200)

| | |
|---|---|
| **Decision** | Webhook controller returns `200` immediately, enqueues BullMQ job, processes async |
| **Why** | Nomba retries on failure (5× exponential backoff); slow processing causes duplicate events |
| **Requires** | Deduplication by `requestId`; idempotent charge handlers |

### ADR-004: Money as Decimal strings across boundaries

| | |
|---|---|
| **Decision** | Prisma `Decimal(12,2)`; API JSON transports amounts as strings (`"35000.00"`) |
| **Why** | Avoid floating-point rounding in billing — industry standard for payment systems |

### ADR-005: Multi-tenancy via `merchantId` scoping

| | |
|---|---|
| **Decision** | Every data query filters by authenticated `merchantId`. No cross-tenant access |
| **Why** | Security-by-design; one missed filter = data breach |
| **Enforcement** | Repository layer always receives `merchantId` from auth guard, never from request body |

### ADR-006: AI service is internal-only

| | |
|---|---|
| **Decision** | FastAPI not public; NestJS calls it with `X-Internal-Secret` |
| **Why** | Prevents direct model abuse; single orchestration point for audit logs |

### ADR-007: pnpm monorepo

| | |
|---|---|
| **Decision** | `apps/*` + `packages/*` with pnpm workspaces |
| **Why** | Shared Prisma client and types; one lockfile; team standard |

---

## 3. Repository layout

```
nombaflow/
├── apps/
│   ├── web/                 # @nombaflow/web — Next.js
│   ├── api/                 # @nombaflow/api — NestJS
│   │   └── src/modules/
│   │       ├── auth/
│   │       ├── merchants/
│   │       ├── plans/
│   │       ├── subscriptions/
│   │       ├── charges/
│   │       ├── webhooks/
│   │       ├── dunning/
│   │       ├── ajo/
│   │       ├── notifications/
│   │       └── analytics/
│   └── ai-service/          # FastAPI (not a pnpm package)
├── packages/
│   ├── database/            # Prisma schema + migrations
│   └── types/               # Shared TS types / Zod schemas
└── docs/
```

**NestJS module rule:** One module per domain folder. Each module exports a service; controllers only handle HTTP. No business logic in controllers.

---

## 4. Core flows

### 4.1 Merchant enrollment (customer subscribes)

```
Customer → GET /enroll/:planId (Next.js)
        → POST /customers/enroll (NestJS)
        → POST /v1/checkout/order (Nomba, tokenizeCard: true)
        → Redirect to checkoutLink
        → Customer pays on Nomba Checkout
        → payment_success webhook → store nombaTokenKey → create Subscription ACTIVE
```

### 4.2 Recurring billing

```
BullMQ scheduler (hourly) → query due subscriptions
                          → POST /v1/checkout/tokenized-card-payment
                          → payment_success | payment_failed webhook
                          → advance nextBillingDate | trigger dunning
```

### 4.3 Dunning

```
payment_failed → emit dunning:required
              → POST /predict-retry (AI service)
              → schedule BullMQ delayed job
              → retry charge at scheduledAt
              → 3 failures → SUSPENDED
```

### 4.4 Ajo payout

```
All members contributed → POST /v2/transfers/bank
                       → payout_success webhook → advance round
```

---

## 5. Event-driven internals

| Queue | Purpose | Priority |
|---|---|---|
| `webhook-processing` | Nomba webhook async handling | High |
| `charge-execution` | Scheduled billing runs | High |
| `dunning-retry` | Delayed retry jobs | Medium |
| `notification-dispatch` | Resend emails | Low |

**Rule:** Domain services emit internal events; queue workers call services. Never call Nomba from a webhook handler synchronously.

---

## 6. External dependencies

| Service | Purpose | Failure mode |
|---|---|---|
| Nomba API | Payments | Retry with backoff; surface `NOMBA_API_ERROR` to merchant |
| Neon PostgreSQL | Primary data | Hard fail — app unhealthy |
| Upstash Redis | Queues | Fall back to sync processing for demo only; log critical alert |
| Resend | Email | Queue + retry; log failed notifications |
| Anthropic | NL insights only | Graceful degrade — hide insights UI |
| AI models (local) | Dunning/forecast | Fixed 72h retry schedule fallback |

---

## 7. API surface

- **Public:** `POST /webhooks/nomba` (signature-verified)
- **Merchant auth:** `POST /auth/*`, `GET|POST /api/v1/*` (JWT)
- **Customer:** `GET /customers/:id/portal`, `POST /customers/enroll` (public enrollment)
- **Internal:** AI service endpoints (not exposed to internet)

Full shapes: [API Contract](./NombaFlow_API_Contract_v2.md)

---

## 8. Security architecture

See [SECURITY_ARCHITECTURE.md](../security/SECURITY_ARCHITECTURE.md). Security is not a Day 3 task — implement with each issue:

- #6: bcrypt, JWT expiry
- #7: encrypt OAuth secrets at rest
- #8: webhook signature verification
- #11: `pnpm audit` in CI
- All modules: `merchantId` scoping, Zod validation

---

## 9. What we are NOT building (boundaries)

Per [PRD §5.3](../product/NombaFlow_PRD_v2.md):

- Proration, multi-currency, POS, white-label, WhatsApp, installment plans
- Public developer API / API keys for third parties
- Microservices, Kubernetes, Terraform (hackathon scope)

---

## 10. Related documents

| Topic | Document |
|---|---|
| Nomba integration | [Nomba API Verified](./NombaFlow_Nomba_API_Verified.md) |
| Database | [Database Schema](./NombaFlow_Database_Schema.md) |
| API shapes | [API Contract](./NombaFlow_API_Contract_v2.md) |
| Coding rules | [Coding Standards](./CODING_STANDARDS.md) |
| Git/PR process | [Development Workflow](./DEVELOPMENT_WORKFLOW.md) |
| Tasks | [GitHub Issues](../operations/NombaFlow_GitHub_Issues.md) |
