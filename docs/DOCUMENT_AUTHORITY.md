# Document Authority & Supersession Guide

This file resolves conflicts between documents in the NombaFlow repository.

## Golden rule

**[Nomba developer documentation](https://developer.nomba.com/docs/introduction/welcome-to-nomba) is the ultimate source of truth for all payment behavior.** When in doubt, fetch the relevant page from `https://developer.nomba.com/llms.txt` and verify.

## Superseded content in the masterplan

The [masterplan](./strategy/nomba_hackathon_masterplan.md) was generated before Nomba API verification. These masterplan sections contain outdated assumptions — do **not** implement from them:

| Masterplan reference | Outdated assumption | Authoritative replacement |
|---|---|---|
| Part 4 — Merchant onboarding | Single "Nomba API key" paste | OAuth `clientId` + `clientSecret` + `accountId` ([Verified doc §1](./engineering/NombaFlow_Nomba_API_Verified.md)) |
| Part 4 — Webhook events | `payment.success`, `checkout.completed` | `payment_success`, `payment_failed` ([Nomba webhooks](https://developer.nomba.com/docs/api-basics/webhook)) |
| Part 4 — Enrollment | `checkoutUrl`, `nombaTokenId` | `checkoutLink`, `nombaTokenKey` ([Verified doc §5, §8](./engineering/NombaFlow_Nomba_API_Verified.md)) |
| Part 4 — Ajo payouts | `transfer.success` | `payout_success` / `payout_failed` |
| Part 11 — Prisma schema | `nombaApiKey`, `nombaTokenId` | OAuth fields + `nombaTokenKey` ([Database Schema](./engineering/NombaFlow_Database_Schema.md)) |
| Part 12 — API endpoints | `POST /merchants/me/nomba-key` | `POST /merchants/me/nomba-credentials` ([API Contract §3](./engineering/NombaFlow_API_Contract_v2.md)) |
| Part 7/10 — Authentication | Auth.js v5 on Next.js | NestJS JWT + httpOnly cookies ([Architecture ADR-002](./engineering/ARCHITECTURE.md)) |

## Overlap resolution (not conflicts)

| Topic | Summary doc | Detailed doc | Rule |
|---|---|---|---|
| Screens | PRD §6 | UI Spec | UI Spec wins for implementation |
| Emails | PRD §7 | Email Templates | Email Templates wins |
| Demo data | PRD §9 | Demo Script §2 | Demo Script wins (more detail) |
| Env vars | Masterplan Part 7/10 | Env Variables doc | Env Variables doc wins |
| Tasks | Masterplan Part 15 | GitHub Issues | GitHub Issues wins |

## Duplicate documents policy

There is **one file per topic**. Do not create `PRD_v3` or parallel schema files. Update the authoritative file in place and note changes in git commit messages.
