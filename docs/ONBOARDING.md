# NombaFlow — Team Onboarding

**Read this before picking up your first issue.**

---

## Team & ownership

| Person | Role | GitHub label | Start here |
|---|---|---|---|
| Backend Developer | API, DB, Nomba, queues, email | `owner: backend` | Issues #3, #5, #6 |
| Full Stack Developer | UI, monorepo, demo | `owner: fullstack` | Issues #2, #9 |
| AI Specialist | FastAPI, models | `owner: ai` | Issue #4 |

Pick up work from the [GitHub Issues board](https://github.com/Vitalisn4/NombaFlow/issues).

---

## Day 0 checklist (before writing code)

- [ ] Clone repo, run `pnpm install` from root
- [ ] Read [Architecture](./engineering/ARCHITECTURE.md) (15 min)
- [ ] Read [Nomba API Verified](./engineering/NombaFlow_Nomba_API_Verified.md) (Backend + Full Stack — 20 min)
- [ ] Skim your Day 1 issues on [GitHub](https://github.com/Vitalisn4/NombaFlow/issues)
- [ ] Join team password manager vault for secrets
- [ ] Get access: GitHub repo, Neon, Upstash, Railway, Vercel, Resend, Anthropic

---

## Document map (single source of truth)

| Question | Read this |
|---|---|
| What are we building? | [PRD](./product/NombaFlow_PRD_v2.md) |
| What does the screen look like? | [UI Spec](./product/NombaFlow_UI_Spec.md) |
| What is the API shape? | [API Contract](./engineering/NombaFlow_API_Contract_v2.md) |
| What is the DB schema? | [Database Schema](./engineering/NombaFlow_Database_Schema.md) + `packages/database/prisma/schema.prisma` |
| How does Nomba work? | [Nomba API Verified](./engineering/NombaFlow_Nomba_API_Verified.md) |
| Architecture decisions? | [Architecture](./engineering/ARCHITECTURE.md) |
| How do I code/review? | [Coding Standards](./engineering/CODING_STANDARDS.md) |
| Git & PR process? | [Development Workflow](./engineering/DEVELOPMENT_WORKFLOW.md) |
| Env vars? | [Env Variables](./engineering/NombaFlow_Env_Variables.md) |
| My tasks? | [GitHub Issues](https://github.com/Vitalisn4/NombaFlow/issues) |
| Conflicting docs? | Ask project lead; API Contract and Nomba Verified doc win for implementation |

---

## Local dev quick start

```bash
pnpm install
pnpm dev:api          # :3001/health
pnpm dev:web          # :3000
cd apps/ai-service && uvicorn main:app --reload --port 8000
```

Details: [LOCAL_SETUP.md](./engineering/LOCAL_SETUP.md)

---

## Rules of engagement

1. **One issue in progress** per person at a time
2. **One PR per issue** — do not batch unrelated work
3. **Docs before code** — if the contract is unclear, update the doc first
4. **No scope creep** — PRD §5.3 is the gate
5. **Security is not optional** — see Coding Standards §6 on every PR

---

## First issues by role

### Backend Developer (Day 1)
`#3 → #5 → #6 → #7 → #8` (sequential dependencies)

### Full Stack Developer (Day 1)
`#1 → #2 → #9 → #10` (after #6 for login API)

### AI Specialist (Day 1)
`#4` then prep training data for `#15`

---

## Getting help

- **Nomba API:** [developer.nomba.com](https://developer.nomba.com/llms.txt)
- **Blocked &gt; 2h:** Pair with teammate on the blocking issue
- **Doc conflict:** Flag project lead; [API Contract](./engineering/NombaFlow_API_Contract_v2.md) and [Nomba Verified](./engineering/NombaFlow_Nomba_API_Verified.md) win
