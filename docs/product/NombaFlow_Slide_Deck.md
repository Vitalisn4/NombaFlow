# NombaFlow — Judge Presentation Slide Deck

**Format:** Copy each slide into Google Slides, PowerPoint, or Canva.  
**Duration:** Supports a 3-minute live demo + 2-minute Q&A.  
**Design:** Nomba gold `#F5A623` on black `#0D0D0D` — match UI Spec tokens.

---

## Slide 1 — Title

**NombaFlow**  
Managed Recurring Billing on Nomba

Nomba × DevCareer Hackathon 2026  
Infrastructure Track — Subscriptions Engine

Team: [Names]  
Live demo: [URL] · GitHub: [repo URL]

---

## Slide 2 — The Problem

Nigerian businesses lose **20–40% of recurring revenue** to:

- Failed card charges with no smart retry
- Manual chase-ups (WhatsApp, spreadsheets)
- Rebuilding billing infrastructure on raw payment APIs

Schools, cooperatives, SaaS, churches — everyone rebuilds the same engine.

---

## Slide 3 — Why Nomba, Why Now

Nomba's **Subscriptions Engine track** states the gap explicitly:

> Nomba exposes payment primitives but does not ship a managed subscriptions layer.

NombaFlow is that layer — built entirely on Nomba APIs.

---

## Slide 4 — What NombaFlow Does

**For merchants:** Create plans → share enrollment links → automatic billing → dashboard  
**For customers:** Enroll card once → self-service portal → payment history  
**For cooperatives:** Ajo/esusu groups with automatic collection and payout

**AI differentiation:** Smart dunning predicts *when* to retry, not just *that* to retry.

---

## Slide 5 — Nomba APIs Used

| API | Use |
|---|---|
| OAuth 2.0 | Merchant credential connection |
| Checkout + `tokenizeCard` | Customer enrollment |
| Tokenized card payment | Recurring charges |
| Webhooks | `payment_success`, `payment_failed`, `payout_*` |
| Bank transfers | Ajo group payouts |
| Transactions | Reconciliation & AI training data |

---

## Slide 6 — Architecture

```
Next.js (Vercel)  →  NestJS API (Railway)  →  Nomba APIs
                           ↓
                    FastAPI AI (Railway)
                           ↓
              PostgreSQL (Neon) + Redis (Upstash)
```

Event-driven: BullMQ queues for webhooks, billing, dunning.

---

## Slide 7 — Demo Flow (live)

1. Connect Nomba credentials  
2. Create "JSS1 Term Fees" plan — ₦35,000/month  
3. Customer enrolls via Nomba Checkout  
4. Trigger charge → 1 fails → **AI schedules retry**  
5. Ajo group: Osusu Circle — round progress + payout  

---

## Slide 8 — Metrics (demo account)

| Metric | Value |
|---|---|
| MRR | ₦165,000 |
| Active subscribers | 8 |
| Failed payments | 1 (AI dunning active) |
| 90-day forecast | ₦420,000 |

---

## Slide 9 — AI Features

- **Smart dunning:** LightGBM predicts optimal retry window per customer  
- **Cash flow forecast:** 90-day expected collections  
- **Churn risk:** Flags at-risk subscribers  
- **NL insights:** "Why did revenue drop?" — Claude Haiku + live data  

---

## Slide 10 — Business Model

- **SaaS:** ₦5,000–₦25,000/month per merchant by volume tier  
- **Transaction fee:** 0.5% on processed volume (optional)  
- **TAM:** 41M Nigerian MSMEs collecting on a schedule  

**Beachhead:** Schools, cooperatives, Nigerian SaaS

---

## Slide 11 — What's Next

- Virtual account billing (per-customer NUBAN)  
- WhatsApp dunning notifications  
- Nomba marketplace / partner listing  
- Multi-currency for cross-border SaaS  

---

## Slide 12 — Thank You

**NombaFlow** — the billing layer Nomba doesn't ship yet.

Live: [URL]  
Code: [GitHub]  
Questions?

---

## Speaker notes (Full Stack Developer)

- Open with problem, not product (Slide 2)  
- During live demo, let the UI speak — minimal narration  
- Highlight **dunning badge** on Chidi Okafor's subscription — this is the wow moment  
- If Nomba webhook delays: use hidden simulate-webhook fallback (never mention to judges unless needed)  
- Close with Subscriptions Engine track alignment (Slide 3)
