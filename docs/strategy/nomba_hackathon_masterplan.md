# NOMBA × DEVCAREER HACKATHON 2026
## First-Place Winning Project: Complete Strategy Document

> **Document status:** Strategy and architecture reference for NombaFlow. Nomba API details, database schema, and REST contracts are kept in sync with `docs/engineering/` and `packages/database/`.

---

# ═══════════════════════════════════════════
# PART 0 — FIRST PRINCIPLES ANALYSIS
# ═══════════════════════════════════════════

## Major Payment Challenges in Nigeria

1. **Cash dominance in informal economy** — Over 40% of Nigeria's GDP is informal. Most market traders, artisans, and transport operators still transact in cash, creating reconciliation nightmares and theft exposure.

2. **Failed payment recovery** — Nigeria's card decline rates run between 20–40% due to insufficient funds, network failures, and expired cards. Failed recurring charges are never systematically retried.

3. **No managed subscriptions layer** — Every Nigerian SaaS, school, church, and cooperative must build recurring billing from scratch on top of raw payment primitives. Nomba itself flags this gap explicitly.

4. **Cooperative and group savings fragility** — Ajo and esusu (rotating savings groups) move millions of naira weekly with no digital infrastructure. Default tracking is manual. Disputes are common. Funds go missing.

5. **SME cash flow blindness** — Nigerian SMEs have no real-time financial intelligence. They cannot predict when cash will run out, which customers are late, or which product is eating margin.

6. **Gig worker income volatility** — Dispatch riders, artisans, and freelancers have lumpy income with no financial history, blocking them from any formal credit.

7. **School fee chaos** — Schools chase parents manually. Per-student fee tracking across terms and siblings is a spreadsheet nightmare.

8. **Healthcare payment abandonment** — Patients abandon treatment when upfront full payments are required. Clinics cannot offer structured payment plans without operational infrastructure.

9. **Cross-border trust gap** — African freelancers get paid in foreign currency but cannot easily deploy that liquidity into Nigerian business contexts.

10. **Merchant reconciliation errors** — POS and online channels settle at different times. Multi-location merchants cannot reconcile in real time.

## Gaps in Existing Infrastructure

- No managed dunning engine for Nigerian recurring billing
- No AI-powered cash-flow forecasting for micro-merchants
- No cooperative financial OS with embedded payments
- No gig-worker financial profile builder
- No unified financial intelligence layer across Nomba APIs

---

# ═══════════════════════════════════════════
# PART 1 — PRIMARY WINNING PROJECT
# ═══════════════════════════════════════════

## PROJECT NAME: **NombaFlow**

### Tagline
> *The Recurring Revenue Engine for African Businesses — Built on Nomba.*

---

### One-Line Pitch

NombaFlow is a managed subscriptions and recurring revenue infrastructure that gives any Nigerian business — schools, cooperatives, SaaS products, clinics, churches, landlords — a complete billing engine with AI-powered dunning, cash-flow forecasting, and zero-code setup, all built on Nomba's payment primitives.

---

### Elevator Pitch (90 seconds)

Every time a Nigerian business needs recurring payments — school fees, cooperative contributions, SaaS subscriptions, church tithes, clinic installment plans — they have to rebuild the same billing infrastructure from scratch. Retry logic. Dunning emails. Failed payment recovery. Customer portals. It costs months of engineering time. Most just give up and chase customers manually by WhatsApp.

NombaFlow solves this permanently. We are a managed recurring billing engine that sits directly on top of Nomba's checkout, tokenised cards, charge, virtual account, and webhook APIs and exposes a clean merchant-facing dashboard and developer API that any team can plug into in under 30 minutes.

On top of the billing engine, we layer an AI module that predicts which customers will default before the charge runs, recommends the optimal retry window, and gives each merchant a real-time cash-flow forecast for the next 90 days.

This is not a feature. This is infrastructure. Nomba themselves flag this as a gap they want solved. We are the team solving it.

---

### Problem Statement

Nigeria has no managed recurring billing layer built on production-grade payment rails. The primitives exist inside Nomba. The demand exists across every vertical — education, healthcare, SaaS, cooperatives, religion, real estate. The engineering capability to stitch them together is rare and expensive.

The result: recurring revenue remains unreliable, churn is unmanaged, cash flows are unpredictable, and Nigerian businesses leave enormous recoverable revenue on the table every month.

---

### Why This Problem Matters

- Nigeria has 41 million MSMEs. The majority that attempt any subscription model build it manually on top of raw payment APIs.
- School fees alone represent a ₦2+ trillion annual market, most of which is collected ad-hoc.
- Ajo/esusu groups manage an estimated ₦500 billion annually with zero digital infrastructure.
- A 15% improvement in payment recovery across even 0.1% of Nigerian SMEs recovers hundreds of billions of naira annually.

---

### Why Now

1. Nomba has production-grade tokenised card and virtual account APIs live today — the primitives are ready.
2. Nigeria's digital payment adoption grew 41% YoY through 2024–2025.
3. The Subscriptions Engine track in this exact hackathon confirms Nomba sees this gap and wants the ecosystem to build it.
4. AI dunning and cash flow prediction are now possible with small models at near-zero cost.

---

### Market Opportunity

| Segment | Addressable Users | Annual Revenue Potential |
|---|---|---|
| Schools (public + private) | 180,000+ | ₦800B in fee collections |
| Cooperatives / Ajo groups | 2M+ groups | ₦500B in contribution tracking |
| Nigerian SaaS products | 3,000+ companies | Growing subscription economy |
| Clinics / hospitals | 40,000+ | ₦300B in installment plans |
| Churches / nonprofits | 500,000+ | ₦200B in tithes/donations |
| Landlords / property managers | 5M+ | ₦1.2T in rent collection |

**Total SAM: ₦3+ trillion in recurring payment volume**
**NombaFlow revenue at 0.5% transaction fee + ₦5,000/month SaaS = massive unit economics**

---

### Target Users

**Primary:** Any Nigerian business or organization that collects money from multiple people on a recurring or scheduled basis.

**Secondary:** Developers who want to embed subscription billing into their products via NombaFlow's API.

---

### User Personas

**Persona 1 — Adaeze, Private School Bursar (Enugu)**
- Manages fee collection for 600 students across 3 terms
- Currently chases parents by WhatsApp and records payments in Excel
- Loses 12% of expected revenue to late/missing payments per term
- Wants: automated payment schedules, reminders, per-student dashboards

**Persona 2 — Emeka, Ajo Group Coordinator (Lagos Market)**
- Manages a 40-person weekly rotating savings group
- Currently keeps records in a notebook and transfers manually
- Has experienced two defaults and one complete group collapse
- Wants: digital contribution tracking, automatic transfer to the week's beneficiary, default alerts

**Persona 3 — Ngozi, Nigerian SaaS Founder (Abuja)**
- Runs a B2B accounting tool with 200 paying customers
- Built recurring billing herself using raw Paystack; it breaks constantly
- Loses 8% of MRR to failed card charges she never retries
- Wants: reliable recurring billing, dunning engine, customer self-service portal

**Persona 4 — Dr. Yemi, Clinic Director (Ibadan)**
- Wants to offer installment payment plans for elective procedures
- Cannot do this today because she has no infrastructure to track partial payments
- Wants: structured payment plan creation, automatic debit on schedule, balance tracking

---

### Competitor Analysis

| Competitor | What They Do | Why They Lose to NombaFlow |
|---|---|---|
| Paystack Subscriptions | Basic recurring billing | No AI dunning, no cooperative support, no installment plans, not on Nomba rails |
| Flutterwave Plans | Subscription plans | Same limitations; no intelligence layer |
| Subbly / Chargebee | Global subscription tools | Not Nigeria-native; no Nomba integration; foreign pricing |
| Manual WhatsApp billing | What most SMEs use today | Not scalable; no automation; no data |

**NombaFlow's moat:** The only recurring billing engine purpose-built on Nomba's APIs, with AI-powered recovery, purpose-built for Nigeria's diverse recurring payment contexts.

---

### Unique Value Proposition

> NombaFlow is the only recurring revenue engine that combines Nomba's payment primitives, AI-powered payment recovery, and Nigeria-first use cases (ajo groups, school fees, clinic installments) into a single infrastructure product any business can deploy in 30 minutes.

---

### Why This Can Win the Hackathon

1. **Directly addresses the Subscriptions Engine track** — Nomba explicitly lists this as a gap they want filled.
2. **Infrastructure play, not a feature** — Judges remember platforms, not point solutions.
3. **Multi-API depth** — Uses Checkout API, Tokenised Cards, Charge API, Virtual Accounts, Transfers, Webhooks, Transactions API. This is the deepest possible Nomba integration.
4. **Real AI, not decorative** — AI dunning and cash-flow prediction have measurable ROI.
5. **Nigeria-first use cases** — Ajo/esusu integration is unexpected, culturally resonant, and addresses a massive informal economy gap.
6. **Demo-able in 3 minutes** — School bursar creating a fee schedule, system sending reminders, failed payment being retried by AI, dashboard updating live.
7. **Startup-scale ambition** — This is a fundable company on day one.

---

# ═══════════════════════════════════════════
# PART 2 — INNOVATION ANALYSIS
# ═══════════════════════════════════════════

## Why the Solution is Innovative

1. **State machine completeness** — NombaFlow models every subscription as a formal state machine: `draft → active → past_due → dunning → suspended → cancelled → reactivated`. No Nigerian payment product does this.

2. **AI dunning with behavioral prediction** — Instead of dumb retry schedules (retry after 3 days), NombaFlow's AI analyzes each customer's transaction history to predict the optimal retry window. A customer who always tops up salary on the 28th gets a retry on the 29th, not the 3rd day.

3. **Ajo/esusu as first-class primitive** — Rotating savings groups are modeled as a specialized subscription type where contributions flow in from N members and the full pot transfers out to a rotating beneficiary on schedule. This has never been done on production Nigerian payment rails.

4. **API-first for developers** — Every feature accessible via REST API with webhook callbacks, so developers can embed NombaFlow billing into their own products.

5. **90-day cash flow forecasting** — AI model trained on payment history predicts expected collections, expected failures, and net cash position 90 days out. This is CFO-level intelligence for a market trader.

## Why Existing Solutions Are Insufficient

- Paystack Subscriptions and Flutterwave Plans are basic CRUD interfaces over payment APIs with no intelligence layer, no cooperative support, no installment plans, and no dunning engine.
- Foreign tools (Chargebee, Stripe Billing) do not support Nigerian card flows, naira, or Nomba rails.
- Manual processes (WhatsApp, Excel) do not scale and produce no data.

## The "Wow Factor"

**Live demo moment:** Judge watches a school bursar create a payment schedule for 5 students in 90 seconds. One student's card declines. The AI instantly predicts the student's optimal retry window based on their payment history and schedules a retry for two days later when their account balance historically peaks. The system sends a WhatsApp/email reminder 24 hours before the retry. The retry succeeds. The bursar's dashboard updates in real time. Total manual effort: zero.

---

# ═══════════════════════════════════════════
# PART 3 — PRODUCT FEATURES
# ═══════════════════════════════════════════

## MVP Features (Hackathon Demo)

- [ ] Merchant onboarding with Nomba OAuth credential connection
- [ ] Subscription plan creation (fixed amount, billing cycle, trial period)
- [ ] Customer enrollment with tokenised card capture via Nomba Checkout
- [ ] Virtual account assignment per customer via Nomba Virtual Account API
- [ ] Automated charge execution on billing date via Nomba Charge API
- [ ] Webhook event processing (payment success, failure, partial)
- [ ] Basic dunning: 3 automatic retries with configurable intervals
- [ ] Customer self-service portal (view balance, update card, pause)
- [ ] Merchant dashboard: MRR, churn, failed payments, upcoming charges
- [ ] Email notifications (charge success, failure, upcoming reminder)
- [ ] Ajo/esusu group type: rotating beneficiary schedule with automatic payout via Nomba Transfers

## Advanced Features (Post-Hackathon V1)

- [ ] Multi-currency support (NGN primary)
- [ ] Proration on plan changes
- [ ] Installment plans for one-time purchases (clinics, high-ticket items)
- [ ] Coupon and discount engine
- [ ] Multi-tenant merchant portal
- [ ] Per-student/per-customer reporting for schools and cooperatives
- [ ] WhatsApp notification integration
- [ ] Bulk CSV customer import
- [ ] POS integration for in-person subscription enrollment
- [ ] Multi-location merchant reconciliation

## AI Features

- [ ] **Smart Dunning Engine** — ML model predicting optimal retry time per customer
- [ ] **Churn Prediction** — 30-day churn probability score per customer
- [ ] **90-Day Cash Flow Forecast** — Predicted collections, failures, net position
- [ ] **Anomaly Detection** — Flags unusual payment patterns (potential fraud, data errors)
- [ ] **Expense Categorization** — Auto-categorizes outgoing transfers by type
- [ ] **Natural Language Insights** — Merchant can ask "Why did my revenue drop this month?" and get a plain-English answer
- [ ] **Creditworthiness Signal** — Exports a payment reliability score per customer, usable for micro-lending

## Future Expansion Features

- [ ] Embedded finance: micro-credit to merchants based on NombaFlow revenue data
- [ ] NombaFlow API marketplace: third parties embed billing into their products
- [ ] Pan-African expansion: GHS, KES, ZAR support via partner rails
- [ ] White-label offering for banks wanting to offer subscription billing to their SME customers
- [ ] Open banking integration for balance-aware retry timing

---

# ═══════════════════════════════════════════
# PART 4 — NOMBA API INTEGRATION
# ═══════════════════════════════════════════

## APIs Used and Why

| Nomba API | Usage in NombaFlow | Why |
|---|---|---|
| **Checkout API** | Customer card enrollment, tokenisation | Securely capture and tokenise cards without PCI scope |
| **Tokenised Cards** | Store customer payment method for recurring charges | Required for subscription charging without re-entering card |
| **Charge API** | Execute subscription charges on billing date | Core billing execution |
| **Virtual Account API** | Assign per-customer NUBAN-like account for bank transfer billing | Alternative payment method for customers without cards |
| **Transfers API** | Ajo group payouts to beneficiaries; refunds | Automated money movement out of the platform |
| **Webhooks** | Receive real-time events: `payment_success`, `payment_failed`, `payout_success`, `payout_failed` | Trigger state machine transitions, notifications, dunning |
| **Transactions API** | Reconciliation, history, reporting | Merchant dashboard data, AI training data |

## Payment Lifecycle

```
SUBSCRIPTION LIFECYCLE STATE MACHINE

Customer Enrolls
       │
       ▼
[PENDING] ──card tokenised──► [ACTIVE]
                                  │
                            billing_date arrives
                                  │
                                  ▼
                         Nomba Charge API called
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
              payment_success              payment_failed
                    │                            │
                    ▼                            ▼
              [ACTIVE]                    [PAST_DUE]
           next cycle starts              AI calculates
                                          retry_at
                                               │
                                         retry window
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                              retry.success         retry.failed (x3)
                                    │                     │
                                    ▼                     ▼
                               [ACTIVE]            [DUNNING]
                                                 notify customer
                                                        │
                                               ┌────────┴────────┐
                                               │                 │
                                         customer pays     no response (7d)
                                               │                 │
                                               ▼                 ▼
                                          [ACTIVE]        [SUSPENDED]
                                                                 │
                                                          merchant decision
                                                               │   │
                                                        cancel  reactivate
                                                          │         │
                                                    [CANCELLED] [ACTIVE]
```

## Webhook Events Handled

```
payment_success          → update subscription status, record charge, send success email
payment_failed           → trigger AI dunning engine, log failure, send failure email
payout_success           → update ajo beneficiary record, advance rotation
payout_failed            → alert merchant, queue retry
payment_reversal         → reverse charge, update subscription balance
payout_refund            → update payout status
```

Enrollment confirmation uses `payment_success` with `tokenizedCardData.tokenKey` — there is no separate checkout-completed event.

## Merchant Onboarding Flow

```
1. Merchant registers on NombaFlow
2. Enters Nomba OAuth credentials (clientId, clientSecret, accountId)
3. NombaFlow validates via POST /v1/auth/token/issue and stores encrypted tokens
4. Merchant creates first subscription plan (name, amount, cycle)
5. NombaFlow generates hosted enrollment link
6. Merchant shares link with customers
7. Customers complete Nomba Checkout → card tokenised (`tokenizeCard: true`)
8. NombaFlow stores `nombaTokenKey` from `payment_success` webhook
9. First charge runs automatically on plan start date via tokenized-card-payment
10. Merchant dashboard activates
```

## Transaction Reconciliation

```
Every 24 hours:
1. NombaFlow queries Transactions API for all merchant transactions
2. Matches each transaction to a subscription record by reference ID
3. Identifies any orphaned transactions (paid but no matching subscription)
4. Flags any subscriptions with no matching transaction for expected billing dates
5. Generates reconciliation report for merchant
6. Feeds transaction data into AI cash-flow model
```

## Error Handling and Retry

```
API Error Categories:
- 4xx (client errors): log, alert merchant, do not retry
- 429 (rate limit): exponential backoff: 1s → 2s → 4s → 8s → 16s
- 5xx (server errors): retry 3x with backoff, then dead letter queue
- Network timeout: retry 2x, then mark as pending_verification

Dead Letter Queue:
- Failed events stored in Redis queue
- Manual review dashboard for merchant
- Automatic re-processing after Nomba incident resolution
```

---

# ═══════════════════════════════════════════
# PART 5 — AI CAPABILITIES
# ═══════════════════════════════════════════

## 1. Smart Dunning Engine (Core AI Feature)

**Problem:** Dumb dunning retries at fixed intervals (day 1, day 3, day 7) ignore customer behavior. A market trader who restocks on Thursdays will always have money on Thursday. Retrying on Monday is wasted noise.

**Solution:** Feature-engineered ML model per customer:

```python
Features extracted per customer:
- historical_payment_day_of_week  (when they usually pay)
- historical_payment_day_of_month (salary day inference)
- account_activity_pattern        (high balance windows)
- time_since_last_successful_payment
- failure_reason_code             (insufficient_funds vs declined vs expired)
- retry_success_history           (which retry intervals worked before)

Model: LightGBM classifier
Output: optimal_retry_timestamp (next 72 hours)
Accuracy target: >65% improvement over random retry
```

**Cold Start:** For new customers with no history, NombaFlow uses segment-level priors (by business type, location, customer age).

## 2. Churn Prediction

```python
Features:
- days_since_last_payment_success
- consecutive_failed_charges
- customer_self_service_activity (portal logins)
- payment_method_update_recency
- subscription_age
- plan_price_tier

Model: Logistic Regression (interpretable, explainable to merchant)
Output: churn_probability_30d (0.0 – 1.0)
Action: Merchant dashboard shows "At Risk" badge on customers >0.7 score
```

## 3. 90-Day Cash Flow Forecast

```python
Per-merchant model:
- Historical collection rates by customer segment
- Seasonal patterns (end of month, school term starts)
- Expected new enrollments based on growth trend
- Expected churns based on churn prediction model
- Scheduled charges from active subscriptions

Output:
- expected_collections_next_30d
- expected_collections_next_60d
- expected_collections_next_90d
- risk_adjusted_forecast (accounting for predicted failures)
- waterfall chart: collected vs at-risk vs projected
```

## 4. Natural Language Financial Insights

```python
Merchant asks: "Why did my revenue drop last month?"

NombaFlow:
1. Queries transaction history for the period
2. Runs attribution analysis: churned customers, failed payments, plan downgrades
3. Compares to previous period
4. Generates plain-English explanation:
   "Your revenue dropped ₦180,000 last month. The main cause was 
   12 subscription cancellations in week 2, mostly from customers 
   on your Basic plan. Of those, 8 had 3+ consecutive failed 
   charges before cancelling — catching these earlier with dunning 
   could have retained ₦96,000."

Implementation: Claude Haiku via Anthropic API (free tier sufficient for hackathon)
```

## 5. Fraud and Anomaly Detection

```python
Rule-based + statistical anomaly detection:
- Velocity checks: same card charged >3x in 24h → flag
- Geographic anomaly: card used in 2 locations simultaneously → flag  
- Amount anomaly: charge significantly above plan amount → flag
- Pattern break: customer who always pays suddenly has 10 failed attempts → flag

Implementation: Z-score statistical model on transaction features
No heavy ML required — rules + statistics catch 90% of real cases
```

---

# ═══════════════════════════════════════════
# PART 6 — SYSTEM ARCHITECTURE
# ═══════════════════════════════════════════

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Next.js Merchant Dashboard  |  Customer Self-Service Portal   │
│  Developer API Docs (Mintlify/Swagger)                         │
└───────────────────┬─────────────────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                       │
│  Rate Limiting | Auth Middleware | Request Validation           │
│  /api/v1/subscriptions  /api/v1/customers  /api/v1/analytics   │
└──────┬──────────────┬──────────────────────┬────────────────────┘
       │              │                      │
┌──────▼──────┐ ┌─────▼──────┐  ┌───────────▼─────────────────┐
│ Subscription│ │  Customer  │  │      AI Service             │
│   Engine    │ │  Service   │  │   (Python FastAPI)          │
│  (NestJS)   │ │  (NestJS)  │  │   Dunning | Forecast        │
│             │ │            │  │   Churn | Insights          │
└──────┬──────┘ └─────┬──────┘  └───────────┬─────────────────┘
       │              │                      │
┌──────▼──────────────▼──────────────────────▼────────────────────┐
│                   POSTGRESQL (Neon)                             │
│  subscriptions | customers | charges | events | merchants      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                   REDIS (Upstash)                               │
│  Job Queue | Rate Limit Counters | Session Cache | Dead Letters │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                   NOMBA PAYMENT RAILS                           │
│  Checkout API | Charge API | Virtual Accounts | Transfers       │
│  Tokenised Cards | Webhooks | Transactions API                  │
└─────────────────────────────────────────────────────────────────┘
```

## Service Architecture (Modular Monolith for Hackathon)

```
nombaflow/
├── apps/
│   ├── web/                    # Next.js 16 App Router (Vercel)
│   │   ├── app/(dashboard)/    # Merchant dashboard
│   │   ├── app/(portal)/       # Customer self-service
│   │   └── app/api/            # Next.js API routes
│   │
│   └── api/                    # NestJS backend (Railway)
│       ├── modules/
│       │   ├── auth/           # Auth.js v5
│       │   ├── merchants/      # Merchant management
│       │   ├── subscriptions/  # Core billing engine
│       │   ├── customers/      # Customer management
│       │   ├── charges/        # Charge execution
│       │   ├── dunning/        # Retry logic
│       │   ├── webhooks/       # Nomba webhook processor
│       │   ├── notifications/  # Email/WhatsApp
│       │   └── analytics/      # Dashboard data
│       │
│       └── ai-service/         # Python FastAPI (Railway)
│           ├── dunning/        # Smart retry prediction
│           ├── forecasting/    # Cash flow model
│           ├── churn/          # Churn prediction
│           └── insights/       # NL financial insights
│
└── packages/
    ├── database/               # Prisma schema + migrations
    ├── types/                  # Shared TypeScript types
    └── nomba-client/           # Typed Nomba API wrapper
```

## Billing Cycle Execution (Sequence Diagram)

```
Scheduler (cron: every hour)
    │
    ├─► Query: SELECT subscriptions WHERE next_billing_date <= NOW()
    │
    ├─► For each due subscription:
    │       │
    │       ├─► Create charge_attempt record (status: initiated)
    │       │
    │       ├─► Call POST /v1/checkout/tokenized-card-payment (tokenKey, amount, orderReference)
    │       │
    │       ├─► Receive 202 Accepted (async)
    │       │
    │       └─► Wait for webhook: payment_success OR payment_failed
    │
Webhook Handler (/webhooks/nomba)
    │
    ├─► Verify HMAC signature
    ├─► Parse event type
    ├─► Update charge_attempt status
    ├─► Emit internal domain event
    │
    ├─► [payment_success]
    │       ├─► Update subscription.status = active
    │       ├─► Set next_billing_date = current + interval
    │       ├─► Generate invoice record
    │       └─► Send success notification
    │
    └─► [payment_failed]
            ├─► Update subscription.status = past_due
            ├─► Log failure_reason
            ├─► Emit dunning_required event
            └─► AI Dunning Service calculates retry_at
```

## Queue Architecture (BullMQ on Upstash Redis)

```
Queues:
├── charge-execution        (high priority, concurrency: 10)
├── webhook-processing      (high priority, concurrency: 20)
├── dunning-retry           (medium priority, delayed jobs)
├── notification-dispatch   (low priority, concurrency: 5)
├── reconciliation          (scheduled, daily at 2am)
└── ai-analysis             (low priority, async, concurrency: 2)

Dead Letter Queues (per queue, reviewed every 6 hours):
└── Failed jobs stored with full context for manual review
```

## Database Architecture

```
Multi-tenant design: every table has merchant_id foreign key
Row-level security enforced at application layer
Read replicas for analytics queries (Neon branching)
```

---

# ═══════════════════════════════════════════
# PART 7 — COMPLETE TECH STACK (ALL FREE TIER)
# ═══════════════════════════════════════════

*All versions below were checked against each tool's official docs and release pages as of late June 2026. Pin exact versions in package.json and requirements.txt on Day 1 so the whole team builds against the same stack, since several of these tools (Next.js, Tailwind, Prisma) ship frequent releases.*

## Frontend
| Tool | Current Version (June 2026) | Free Tier | Use |
|---|---|---|---|
| Next.js | 16.x (App Router, Turbopack default) | Open source | Full-stack framework |
| React | 19.2 | Open source | UI library (ships with Next.js 16) |
| TypeScript | 5.x | Open source | Type safety |
| TailwindCSS | 4.x (CSS-first config) | Open source | Styling |
| shadcn/ui | Latest (Tailwind v4 compatible) | Open source | Component library |
| Recharts | Latest | Open source | Dashboard charts |
| React Hook Form + Zod | Latest | Open source | Form validation |

Note: Next.js 14 reached end of life in October 2025 and no longer receives security patches, so the build should start directly on Next.js 16. Key changes from 14 to be aware of: Turbopack is now the default bundler, `cookies()` and `headers()` are async-only, and the minimum Node.js version is 20 (use Node 24 LTS, see Infrastructure section below). Tailwind v4 also drops the JS config file in favor of CSS-first configuration via `@theme` in your main stylesheet, so skip `tailwind.config.js` entirely.

## Backend
| Tool | Current Version (June 2026) | Free Tier | Use |
|---|---|---|---|
| NestJS | 11.1.x | Open source | API framework |
| Node.js | 24.x LTS | Open source | Runtime |
| BullMQ | Latest | Open source | Job queues |
| Zod | Latest | Open source | Validation |

Note: NestJS 12 is on the roadmap for Q3 2026 with a full ESM migration, but it is not stable yet, so build on the current stable 11.1.x line. Use Node.js 24, which is the active LTS line as of June 2026 (Node 22 is still supported but Node 24 is the right default for new projects, and Next.js 16 requires Node 20.9.0 minimum anyway).

## AI Service
| Tool | Current Version (June 2026) | Free Tier | Use |
|---|---|---|---|
| Python | 3.13.x | Open source | Runtime |
| FastAPI | Latest | Open source | AI service API |
| scikit-learn | Latest 1.x | Open source | ML models |
| LightGBM | Latest | Open source | Dunning prediction |
| pandas / numpy | Latest | Open source | Feature engineering |
| Anthropic Claude Haiku 4.5 | Current model | Free tier credits | NL financial insights |

Note: Claude Haiku 4.5 is the current Haiku model as of mid 2026, accessed via model string `claude-haiku-4-5-20251001`. Always check the model string against current Anthropic documentation before locking it into code since model identifiers do get updated.

## Database & Cache
| Tool | Current Version (June 2026) | Free Tier | Use |
|---|---|---|---|
| Neon PostgreSQL | PostgreSQL 17 | Free: 512MB, 3 branches | Primary database |
| Upstash Redis | Latest | Free: 10,000 requests/day | Queue, cache, rate limit |
| Prisma ORM | 7.x | Open source | Database client |

Note: Prisma 7 dropped the old Rust query engine in favor of a TypeScript-native client, which means faster queries and a much smaller install. The schema generator block changes slightly: use `provider = "prisma-client"` instead of `provider = "prisma-client-js"`, and configuration now lives in a `prisma.config.ts` file rather than relying only on the schema file. If anyone on the team is more comfortable with Prisma 6 syntax that's fine too, just pin the version explicitly in package.json so the whole team stays on the same major version during the hackathon.

## Infrastructure & Hosting
| Tool | Free Tier | Use |
|---|---|---|
| Vercel | Free: hobby tier | Next.js frontend |
| Railway | Free: $5 credit/month | NestJS API + Python AI service |
| GitHub Actions | Free: 2,000 min/month | CI/CD |
| Docker + Docker Compose | Open source | Local dev + deployment |

## Auth & Notifications
| Tool | Current Version (June 2026) | Free Tier | Use |
|---|---|---|---|
| Auth.js v5 | Stable (built on @auth/core) | Open source | Authentication |
| Resend | Latest | Free: 3,000 emails/month | Email notifications |
| Cloudflare | N/A | Free tier | CDN, DDoS protection |

Note: Auth.js v5 is stable and works fine on Next.js 16, but there is one Next.js 16 specific gotcha worth knowing before Day 1: Next.js 16 renamed `middleware.ts` to `proxy.ts`, and it must export a function named `proxy` (not `middleware`). The Auth.js v5 docs still show the old middleware pattern in some places, so the working setup is to put your auth config in a separate `auth.config.ts` (edge safe, no Prisma adapter) and import that into `proxy.ts`, while your main `auth.ts` with the database adapter stays out of the edge runtime. This is a five minute fix once you know about it, but it will block your dev server with a confusing error if nobody on the team has seen it before.

## Monitoring & Analytics
| Tool | Free Tier | Use |
|---|---|---|
| Sentry | Free: 5,000 errors/month | Error tracking |
| PostHog | Free: 1M events/month | Product analytics |
| OpenTelemetry | Open source | Distributed tracing |
| Grafana Cloud | Free: 14-day retention | Metrics dashboards |

---

# ═══════════════════════════════════════════
# PART 8 — SECURITY ARCHITECTURE
# ═══════════════════════════════════════════

## OWASP Top 10 Mitigation

```
A01 Broken Access Control:
- Prisma-enforced merchant_id scoping on every query
- RBAC middleware on all routes (merchant_admin, merchant_staff, customer)
- Resource ownership verification before every operation

A02 Cryptographic Failures:
- All data encrypted at rest (Neon default AES-256)
- TLS 1.3 enforced on all connections
- Sensitive fields (`nombaTokenKey`, OAuth tokens) encrypted at application layer with AES-256-GCM
- OAuth `clientSecret` encrypted before storage (never plaintext in DB)

A03 Injection:
- Prisma parameterized queries eliminate SQL injection
- Zod input validation on all request bodies
- No raw SQL except in migrations

A04 Insecure Design:
- Threat modeling documented for all payment flows
- Defense in depth: validation at API gateway, service layer, and database layer

A05 Security Misconfiguration:
- Environment variables via Railway secrets, never in code
- Helmet.js for HTTP security headers
- CORS whitelist: only known frontend domains

A06 Vulnerable Components:
- Dependabot enabled on GitHub
- pnpm audit in CI pipeline, fails build on high severity
- Docker images scanned with Trivy

A07 Auth Failures:
- Auth.js v5 with JWT + refresh token rotation
- 15-minute access token expiry
- Device-aware session management
- Rate limiting: 5 failed logins → 15-minute lockout

A08 Integrity Failures:
- Nomba webhook HMAC-SHA256 signature verification on every event
- Signed URLs for any file uploads
- Subresource integrity for any external scripts

A09 Logging Failures:
- Structured JSON logging via Pino
- Audit log for all financial operations (immutable, append-only)
- PII scrubbed from logs before storage

A10 SSRF:
- No user-supplied URLs executed server-side
- Outbound requests limited to allowlist (Nomba domains, Resend, Anthropic)
```

## Webhook Security

```typescript
// Nomba webhook verification
const verifyNombaWebhook = (payload: string, signature: string, secret: string): boolean => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
};
```

## Secrets Management

```
Development: .env.local (gitignored)
Staging/Production: Railway encrypted environment variables
Rotation: OAuth tokens refreshed automatically (~25 min); webhook secret rotated manually if compromised
Audit: All secret access logged
Never: clientSecret, access tokens, or refresh tokens in code, logs, or error messages
```

---

# ═══════════════════════════════════════════
# PART 9 — AUTHENTICATION & AUTHORIZATION
# ═══════════════════════════════════════════

## Authentication: Auth.js v5

> **Superseded:** Use [Architecture ADR-002](../engineering/ARCHITECTURE.md) — NestJS JWT endpoints + httpOnly cookies on Next.js. The Auth.js example below is historical context only.

```typescript
// auth.config.ts (edge-safe, no database adapter, used by proxy.ts)
export const authConfig = {
  providers: [
    Resend({ /* Magic link via email */ }),
    Credentials({ /* Email + password for merchant dashboard */ })
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.merchantId = user.merchantId;
        token.role = user.role;
      }
      return token;
    }
  }
};

// auth.ts (full config with Prisma adapter, runs on Node runtime, not edge)
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});

// proxy.ts (Next.js 16 renamed middleware.ts to proxy.ts)
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
export default NextAuth(authConfig).auth;
export const config = { matcher: ["/dashboard/:path*", "/settings/:path*"] };
```

## Authorization: RBAC

```
Roles:
├── MERCHANT_OWNER      — Full access to merchant account
├── MERCHANT_ADMIN      — Full access except Nomba credential management
├── MERCHANT_STAFF      — Read-only + customer management
├── CUSTOMER            — Self-service portal only
└── SYSTEM              — Internal service-to-service

Permissions matrix:
Action                   OWNER   ADMIN   STAFF   CUSTOMER
create_subscription       ✓       ✓       ✗        ✗
view_analytics            ✓       ✓       ✓        ✗
manage_api_keys           ✓       ✗       ✗        ✗
update_payment_method     ✓       ✓       ✓        ✓(own)
cancel_subscription       ✓       ✓       ✓        ✓(own)
view_transactions         ✓       ✓       ✓        ✓(own)
```

## MFA Implementation

```
- TOTP (Google Authenticator) for merchant owners
- Magic link email for standard merchants
- SMS OTP via Africa's Talking (Nigerian numbers) for high-value operations
```

---

# ═══════════════════════════════════════════
# PART 10 — DEVOPS
# ═══════════════════════════════════════════

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test
      - run: pnpm audit --audit-level=high

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master

  deploy-staging:
    needs: [test, security]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway (staging)
        run: railway up --environment staging

  deploy-production:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway (production)
        run: railway up --environment production
      - name: Deploy frontend to Vercel
        run: vercel --prod
```

## Branching Strategy (Trunk-Based)

```
main          ── production branch (protected, requires PR + review)
develop       ── staging branch (auto-deploys to staging)
feature/*     ── feature branches (short-lived, max 2 days)
fix/*         ── hotfix branches
```

## Docker Setup

```dockerfile
# apps/api/Dockerfile (monorepo — build from repo root)
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api apps/api
COPY packages packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @nombaflow/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

# ═══════════════════════════════════════════
# PART 11 — DATABASE DESIGN
# ═══════════════════════════════════════════

## Core Schema (Prisma)

**Authoritative schema:** `packages/database/prisma/schema.prisma`  
**Documentation:** [NombaFlow_Database_Schema.md](../engineering/NombaFlow_Database_Schema.md)

The live schema includes OAuth fields on `Merchant` (`nombaClientId`, `nombaClientSecret`, `nombaAccountId`, tokens), `nombaTokenKey` on `Customer`, and full subscription, dunning, ajo, webhook, and notification models.

### Key design rules

- Multi-tenant: every query scoped by `merchantId`
- Money: `Decimal @db.Decimal(12, 2)` — never `Float`
- Critical index: `Subscription @@index([nextBillingDate, status])` for billing scheduler
- Webhook dedup: `WebhookEvent.nombaEventId` unique (`requestId` from Nomba)

### Migration commands

```bash
cd packages/database
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

---

# ═══════════════════════════════════════════
# PART 12 — API DESIGN
# ═══════════════════════════════════════════

## REST Endpoints

```
Base URL: https://api.nombaflow.com/v1

AUTH
POST   /auth/register                 Register merchant
POST   /auth/login                    Get access token
POST   /auth/refresh                  Refresh access token
POST   /auth/logout                   Invalidate session

PLANS
GET    /plans                         List merchant plans
POST   /plans                         Create plan
GET    /plans/:id                     Get plan details
PATCH  /plans/:id                     Update plan
DELETE /plans/:id                     Archive plan

CUSTOMERS
GET    /customers                     List customers
POST   /customers                     Create customer
GET    /customers/:id                 Get customer
PATCH  /customers/:id                 Update customer
POST   /customers/:id/enroll          Generate enrollment link

SUBSCRIPTIONS
GET    /subscriptions                 List subscriptions
POST   /subscriptions                 Create subscription
GET    /subscriptions/:id             Get subscription
POST   /subscriptions/:id/cancel      Cancel subscription
POST   /subscriptions/:id/pause       Pause subscription
POST   /subscriptions/:id/reactivate  Reactivate subscription
GET    /subscriptions/:id/charges     Get charge history

AJO GROUPS
GET    /ajo-groups                    List ajo groups
POST   /ajo-groups                    Create ajo group
GET    /ajo-groups/:id                Get ajo group
POST   /ajo-groups/:id/members        Add member
GET    /ajo-groups/:id/schedule       Get payout schedule

ANALYTICS
GET    /analytics/overview            MRR, churn, failed payments
GET    /analytics/forecast            90-day cash flow forecast
GET    /analytics/customers/:id/score Get customer churn score
POST   /analytics/insights            NL query for insights

WEBHOOKS (Internal Nomba callback)
POST   /webhooks/nomba                Nomba webhook receiver
```

## Error Response Standard

```json
{
  "error": {
    "code": "SUBSCRIPTION_NOT_FOUND",
    "message": "No subscription found with ID sub_01HX2K",
    "details": null,
    "requestId": "req_01HX2K9F",
    "timestamp": "2026-06-29T10:30:00Z"
  }
}

HTTP Status Codes:
200 OK           — Success
201 Created      — Resource created
202 Accepted     — Async operation started
400 Bad Request  — Validation error
401 Unauthorized — Missing/invalid auth
403 Forbidden    — Insufficient permissions
404 Not Found    — Resource not found
409 Conflict     — Duplicate resource
422 Unprocessable — Business logic error
429 Too Many Requests — Rate limited
500 Internal Error — Server error
```

---

# ═══════════════════════════════════════════
# PART 13 — BUSINESS MODEL
# ═══════════════════════════════════════════

## Revenue Model

### Tier 1: Transaction Fee
- **0.4% per successful charge** (capped at ₦2,000)
- Applied to all charges processed through NombaFlow
- Example: Merchant processes ₦5M/month → ₦20,000 revenue to NombaFlow

### Tier 2: SaaS Platform Fee
| Plan | Monthly Price | Limits |
|---|---|---|
| Starter | Free | Up to 50 active subscriptions, 1 plan |
| Growth | ₦15,000/month | Up to 500 subscriptions, unlimited plans |
| Business | ₦45,000/month | Up to 5,000 subscriptions, AI features |
| Enterprise | Custom | Unlimited, white-label, dedicated support |

### Tier 3: AI Add-on
- Smart Dunning Engine: ₦8,000/month
- Cash Flow Forecast: included in Business+
- NL Insights: included in Business+

## Unit Economics (Month 12 Projection)

```
Assumptions:
- 200 merchants (conservative)
- Average 200 subscriptions per merchant
- Average subscription value: ₦8,000/month
- Payment success rate: 88% (vs industry 75% without NombaFlow)

Gross Payment Volume: 200 × 200 × ₦8,000 = ₦320M/month
Transaction fee revenue: ₦320M × 0.4% = ₦1.28M/month
SaaS revenue: 100 Growth × ₦15K + 60 Business × ₦45K = ₦4.2M/month
Total MRR: ₦5.48M (~$3,600/month)
Total ARR: ₦65.76M (~$43,000)

At scale (1,000 merchants, Month 24):
GPV: ₦1.6B/month
Total MRR: ₦27.4M (~$18,000/month)
```

## Go-to-Market Strategy

**Phase 1 (Months 1–3): Developer and Early Adopter**
- Launch on DevCareer community and Nigerian developer Slack groups
- Free tier generously limits to attract usage
- Content marketing: "How to add subscriptions to your Nigerian app in 30 minutes"
- Target: schools and SaaS founders directly

**Phase 2 (Months 4–6): Vertical Expansion**
- School management system integrations
- Church management software integrations
- Cooperative society platforms

**Phase 3 (Months 7–12): Nomba Partnership**
- Deep Nomba merchant onboarding integration
- White-label for Nomba's own merchant portal
- Revenue share arrangement with Nomba

---

# ═══════════════════════════════════════════
# PART 14 — HACKATHON DEMO PLAN
# ═══════════════════════════════════════════

## Demo Storyline (3 minutes, judge-facing)

**Act 1 — The Problem (30 seconds)**
> "Every month, Nigerian schools, cooperatives, and software companies lose 20–30% of expected revenue to failed payments and manual chase-ups. They rebuild the same billing infrastructure over and over. Today we're showing you what it looks like when that problem is solved permanently."

**Act 2 — The Demo (2 minutes)**

1. **Merchant onboarding (20s):** Open NombaFlow. Connect Nomba credentials (Client ID, Secret, Account ID). Done.

2. **Plan creation (20s):** Create "Term 1 School Fees - JSS1" — ₦35,000, due October 1st, 3 monthly installments. Ajo group example: 10 members, weekly ₦5,000 contributions.

3. **Customer enrollment (20s):** Send enrollment link to 5 student parents. They complete Nomba Checkout. Cards tokenised. Show enrolled customers on dashboard.

4. **Live charge execution (20s):** Trigger billing date. Watch charges execute in real time against Nomba Charge API. 4 succeed, 1 fails.

5. **AI dunning activates (20s):** Failed charge triggers AI dunning engine. Model analyzes customer's transaction history. Predicts optimal retry: Saturday at 9am (when their account historically has funds). Retry is scheduled automatically.

6. **Dashboard (20s):** Show merchant dashboard: ₦140,000 collected, ₦35,000 pending retry, 90-day forecast, customer churn scores.

**Act 3 — The Vision (30 seconds)**
> "NombaFlow is not a feature. It is payment infrastructure. We are the managed billing layer that Nomba doesn't ship — and we're built entirely on their APIs. Every Nigerian business that collects recurring money is our customer. That's 41 million MSMEs. We're starting with schools, cooperatives, and SaaS companies. We're building this to be a company."

## Judge Talking Points

- "Applications are now closed" means judges saw many projects — open with the problem, not the product
- "We use 7 Nomba APIs" is memorable when others may use 1–2
- The ajo/esusu feature is culturally resonant and unexpected
- Emphasize: this addresses the Subscriptions Engine track Nomba explicitly listed as a gap

## Metrics to Highlight on Demo Slide

```
₦3T+    Recurring payment volume addressable in Nigeria
20-30%  Revenue lost to failed payments without dunning
7       Nomba APIs integrated
30 min  Time to production for a new merchant
41M     Nigerian MSMEs who need this
```

---

# ═══════════════════════════════════════════
# PART 15 — IMPLEMENTATION ROADMAP
# ═══════════════════════════════════════════

## DAY 1 — Foundation (3 team members)

See [GitHub Issues](../operations/NombaFlow_GitHub_Issues.md) for the authoritative task breakdown.

- **Backend:** Prisma schema, NestJS scaffold, auth API, Nomba OAuth, webhooks, CI
- **Full Stack:** Monorepo init, Next.js scaffold, register/login/onboarding screens
- **AI Specialist:** FastAPI scaffold, synthetic training data prep

**Day 1 Exit Criteria:** Merchant can register, create a plan, and a customer can enroll with a tokenised card.

---

## DAY 2 — Core Engine (3 team members)

- **Backend:** Plans, enrollment, billing scheduler, dunning orchestration, ajo module, emails, analytics API
- **Full Stack:** Dashboard, plans UI, enrollment flow, dunning badge, ajo screens, customer portal
- **AI Specialist:** Dunning model, cash flow forecast

**Day 2 Exit Criteria:** Full billing lifecycle working. AI dunning active. Ajo groups functional. Dashboard showing live data.

---

## DAY 3 — Polish and Demo Preparation (3 team members)

- **Backend:** Production deploy, demo seed data
- **Full Stack:** UI polish, slide deck finalization, demo rehearsal, submission
- **AI Specialist:** Churn model, NL insights (if time)

**Day 3 Exit Criteria:** Demo completes in under 3 minutes. Submission form filed.

---

## SUBMISSION CHECKLIST (legacy — see GitHub Issue #32)

### Technical
- [ ] Live deployed URL (Vercel frontend)
- [ ] API base URL (Railway backend)
- [ ] GitHub repository (public, clean README)
- [ ] All 7 Nomba APIs demonstrated in the live app
- [ ] Webhook integration live (Nomba can send test webhooks)
- [ ] AI features live and demonstrable

### Presentation
- [ ] Slide deck (problem → solution → demo → architecture → business → team → vision)
- [ ] 90-second video demo (backup)
- [ ] Live demo environment seeded with data
- [ ] Every team member knows their part of the demo

### Documentation
- [ ] README with architecture overview
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Nomba API integration notes
- [ ] How the AI features work (one-page explanation)

---

# ═══════════════════════════════════════════
# PART 16 — ALTERNATIVE PROJECT IDEAS
# ═══════════════════════════════════════════

---

## ALTERNATIVE 1: **AjoChain**
### *The Digital Cooperative Banking OS for Nigeria*

**One-line pitch:** AjoChain turns any WhatsApp-based ajo/esusu group into a fully digital cooperative with automated contributions, guaranteed payouts via Nomba Virtual Accounts, AI default prediction, and a group savings score.

**Why it could win:**
- Deeply culturally specific to Nigeria and West Africa
- Solves a ₦500B+ annual market that is completely undigitized
- Strong social impact story (women-led cooperatives, financial inclusion)
- Uses Virtual Accounts as Infrastructure track directly
- AI default prediction is novel and measurable

**Key differentiation from NombaFlow:** AjoChain is vertical-specific (cooperatives only) and goes much deeper — group governance, dispute resolution, savings history reports, micro-credit gateway based on contribution history.

**Stack:** Same as NombaFlow. Add WhatsApp Business API (Meta) for notifications.

**Nomba APIs:** Virtual Account API (per-group account), Transfers API (automated payouts), Webhooks, Transactions API.

**Demo arc:** Mama Ngozi creates an ajo group. 10 members enrolled via WhatsApp link. Week 1: all 10 contribute automatically via their virtual account. Week 1 winner gets automatic Nomba transfer. AI flags one member as high default risk in week 3. Group coordinator is alerted early.

---

## ALTERNATIVE 2: **MerchantMind**
### *The AI Financial Co-pilot for Nigerian SME Merchants*

**One-line pitch:** MerchantMind connects to a merchant's Nomba transaction history and delivers a real-time AI financial advisor that predicts cash flow, flags unusual spending, identifies the most profitable products, and generates a creditworthiness score for micro-lenders — all in under-3-minute daily briefings.

**Why it could win:**
- Nigerian SMEs have zero financial intelligence tools built for their context
- Pure AI play — AI is the product, not a feature
- Uses Transactions API and Webhooks deeply
- Credit scoring angle is compelling for the lending ecosystem
- Accessible to non-technical merchants (conversational UI)

**Key differentiation:** Intelligence layer on top of existing merchant activity, not a new payment product. Merchant doesn't change their workflow at all — they just connect their Nomba key and get insight.

**Stack:** Same as NombaFlow. Add conversational UI (chat interface). Python AI service is the core.

**Nomba APIs:** Transactions API (primary), Webhooks (real-time updates), Merchant APIs.

**Demo arc:** Merchant connects Nomba key. MerchantMind analyzes 3 months of transaction history. Tells merchant: "Your Thursdays are 40% higher revenue than Mondays — do you want to schedule your cash withdrawals accordingly?" and "Customer ID 1042 has been your most loyal buyer. They haven't purchased in 3 weeks. Here is a payment link you can send them." and "Based on your current trend, you will run below ₦50,000 in cash by August 14. Here are your options."

---

# ═══════════════════════════════════════════
# FINAL RECOMMENDATION
# ═══════════════════════════════════════════

## Build NombaFlow.

Here is why it beats the alternatives for the hackathon specifically:

1. **Track alignment** — Nomba's own Subscriptions Engine track says: "Nomba exposes payment primitives but does not ship a managed subscriptions layer, so teams repeatedly rebuild this capability from scratch." This is not a hint. This is Nomba telling you what they want built. Build it.

2. **Deepest API coverage** — NombaFlow uses 7 Nomba APIs. Judges will notice. Most teams will use 2–3.

3. **Broadest market** — Every Nigerian business that collects money on schedule is a potential customer. Schools, cooperatives, SaaS, churches, clinics, landlords. The pitch never runs out of examples.

4. **Team fit** — Backend Developer, Full Stack Developer, and AI Specialist map to NombaFlow's three-service architecture: billing engine + Nomba integrations, merchant/customer UI, and dunning/forecast models.

5. **Demo is visual and memorable** — Watching a failed payment trigger an AI retry prediction in real time on a live dashboard is a moment judges will remember when they're comparing 20 projects.

6. **Post-hackathon viability** — NombaFlow can raise a pre-seed round on this demo. AjoChain and MerchantMind are also fundable but have narrower initial markets.

---

*Document prepared for: Nomba × DevCareer Hackathon 2026*
*Team: Backend Developer, Full Stack Developer, AI Specialist*
*Strategy: First-place targeting via Subscriptions Engine track dominance*
