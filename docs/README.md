# NombaFlow Documentation Index

**Read order for Day 1:** [Onboarding](./ONBOARDING.md) → Nomba Verified → Database Schema → API Contract → GitHub Issues → Local Setup

## New team members

| Document | Purpose |
|---|---|
| [Onboarding](./ONBOARDING.md) | Day 0 checklist, first issues by role |
| [Foundation Readiness](./FOUNDATION_READINESS.md) | Pre-flight checklist before team kickoff |
| [CONTRIBUTING](../CONTRIBUTING.md) | PR rules and quick links |

## Document authority

When documents conflict, this precedence order applies:

| Priority | Document | Governs |
|---|---|---|
| 1 | [Nomba developer docs](https://developer.nomba.com/docs/introduction/welcome-to-nomba) | All payment API behavior |
| 2 | [Nomba API Verified](./engineering/NombaFlow_Nomba_API_Verified.md) | NombaFlow's Nomba integration |
| 3 | [Database Schema](./engineering/NombaFlow_Database_Schema.md) | Data model |
| 4 | [API Contract](./engineering/NombaFlow_API_Contract_v2.md) | REST request/response shapes |
| 5 | [PRD](./product/NombaFlow_PRD_v2.md) | Hackathon scope |
| 6 | [Masterplan](./strategy/nomba_hackathon_masterplan.md) | Strategy context only (some sections superseded) |

See [DOCUMENT_AUTHORITY.md](./DOCUMENT_AUTHORITY.md) for full supersession list.

---

## Strategy

| Document | Purpose |
|---|---|
| [Masterplan](./strategy/nomba_hackathon_masterplan.md) | Original winning idea, market analysis, architecture overview, business model |

## Product

| Document | Purpose |
|---|---|
| [PRD v2](./product/NombaFlow_PRD_v2.md) | Hackathon MVP scope, personas, success criteria |
| [UI Spec](./product/NombaFlow_UI_Spec.md) | Screen-by-screen UI requirements (M01–M12, C01–C04) |
| [Demo Script](./product/NombaFlow_Demo_Script.md) | 3-minute judge demo, seed data, Q&A prep |
| [Slide Deck](./product/NombaFlow_Slide_Deck.md) | 12-slide judge presentation (copy to Google Slides/Canva) |
| [Email Templates](./product/NombaFlow_Email_Templates.md) | Resend/React Email templates |

## Engineering

**Package manager:** pnpm 9 (monorepo) — run all Node commands from repo root unless noted.

| Document | Purpose |
|---|---|
| [Architecture](./engineering/ARCHITECTURE.md) | **SSOT for system design** — ADRs, flows, service boundaries |
| [Coding Standards](./engineering/CODING_STANDARDS.md) | Naming, NestJS structure, security checklist per PR |
| [Development Workflow](./engineering/DEVELOPMENT_WORKFLOW.md) | Branch strategy, PR lifecycle, review focus |
| [Nomba API Verified](./engineering/NombaFlow_Nomba_API_Verified.md) | **SSOT for Nomba integration** — OAuth, webhooks, checkout, transfers |
| [Database Schema](./engineering/NombaFlow_Database_Schema.md) | **SSOT for Prisma schema** |
| [API Contract](./engineering/NombaFlow_API_Contract_v2.md) | **SSOT for REST endpoints** |
| [Environment Variables](./engineering/NombaFlow_Env_Variables.md) | All env vars across three services |
| [Local Setup](./engineering/LOCAL_SETUP.md) | Day 1 developer onboarding |
| [Testing Strategy](./engineering/TESTING_STRATEGY.md) | Test matrix, sandbox cards, E2E plan |

## Security

| Document | Purpose |
|---|---|
| [Security Architecture](./security/SECURITY_ARCHITECTURE.md) | OWASP, webhook verification, encryption, secrets |

## Operations

| Document | Purpose |
|---|---|
| [GitHub Issues](./operations/NombaFlow_GitHub_Issues.md) | **32 ready-to-paste issues** — Section 0: DoD, sizing, dependency index |
| [Team Assignments](./operations/TEAM_ASSIGNMENTS.md) | 3-person ownership map and sequencing |
