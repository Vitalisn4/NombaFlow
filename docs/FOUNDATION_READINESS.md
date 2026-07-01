# NombaFlow — Foundation Readiness Checklist

Use this checklist **before inviting teammates** to pick up issues. Every item should be checked.

---

## Documentation

- [x] [Document Authority](DOCUMENT_AUTHORITY.md) — conflict resolution defined
- [x] [Architecture](engineering/ARCHITECTURE.md) — ADRs, flows, boundaries
- [x] [Security Architecture](security/SECURITY_ARCHITECTURE.md) — threat model, OWASP
- [x] [Coding Standards](engineering/CODING_STANDARDS.md)
- [x] [Development Workflow](engineering/DEVELOPMENT_WORKFLOW.md)
- [x] [Testing Strategy](engineering/TESTING_STRATEGY.md)
- [x] [Onboarding](ONBOARDING.md)
- [x] [API Contract](engineering/NombaFlow_API_Contract_v2.md)
- [x] [Database Schema](engineering/NombaFlow_Database_Schema.md)
- [x] [Nomba API Verified](engineering/NombaFlow_Nomba_API_Verified.md)
- [x] [GitHub Issues](operations/NombaFlow_GitHub_Issues.md) — 32 tickets with AC
- [x] [Team Assignments](operations/TEAM_ASSIGNMENTS.md)

## Repository

- [x] pnpm monorepo scaffolded (`apps/`, `packages/`)
- [x] Prisma schema in `packages/database/prisma/schema.prisma`
- [x] `.gitignore` — env files, `node_modules`, generated Prisma client
- [x] `CONTRIBUTING.md` + PR template + `CODEOWNERS` + Dependabot
- [x] `.env.example` files in each app
- [x] `pnpm-lock.yaml` committed
- [x] GitHub repo created and connected (`origin`)
- [x] Branch protection on `main`
- [x] Labels and milestones created from Issues doc §1–2

## Team setup (you do before kickoff)

- [ ] Neon database provisioned; `DATABASE_URL` in team vault
- [ ] Upstash Redis provisioned
- [ ] Nomba sandbox credentials obtained
- [ ] Resend, Anthropic API keys in vault
- [ ] Railway + Vercel projects created
- [ ] All teammates completed [Onboarding](ONBOARDING.md) Day 0 checklist

## Kickoff meeting agenda (30 min)

1. Walk through [Architecture](engineering/ARCHITECTURE.md) — 10 min
2. Assign Day 1 issues per [Team Assignments](operations/TEAM_ASSIGNMENTS.md) — 5 min
3. Agree standup time + communication channel — 5 min
4. Confirm Definition of Done (Issues doc §0) — 5 min
5. Q&A — 5 min

---

**When repository boxes are checked:** Team is cleared to begin Issue #2+ and parallel Day 1 work. Issue #1 is complete.

**You still need before feature code:** Neon, Upstash, Nomba sandbox, and team secrets (Team setup section below).
