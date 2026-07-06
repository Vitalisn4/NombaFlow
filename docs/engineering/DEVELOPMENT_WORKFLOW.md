# NombaFlow — Development Workflow

---

## 1. Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready only. Protected — PR required |
| `develop` | Integration branch. Auto-deploys to staging |
| `feat/issue-N-short-name` | Feature branches off `develop` |

**Rule:** Never commit directly to `main` or `develop`.

```bash
git checkout develop && git pull
git checkout -b feat/issue-7-nomba-oauth
# ... work ...
git push -u origin feat/issue-7-nomba-oauth
# Open PR → develop
```

---

## 2. Issue → PR → Done lifecycle

```
Backlog → Ready → In Progress → In Review → Done
```

| Step | Owner | Action |
|---|---|---|
| Pick up | Assignee | Move issue to **In Progress** (max 1 per person) |
| Branch | Assignee | `feat/issue-N-description` from `develop` |
| Implement | Assignee | Meet acceptance criteria + Definition of Done |
| PR | Assignee | Open PR linking `Closes #N`, request review |
| Review | Another teammate | Check AC, security checklist, API contract |
| Merge | Reviewer | Squash merge to `develop` |
| Verify | Assignee | Confirm AC on deployed staging |
| Done | Assignee | Move issue to **Done** only after verification |

**Done ≠ PR merged.** Done = acceptance criteria verified on staging/local.

---

## 3. Pull request requirements

Every PR must include:

- [ ] Title: `[#N] Short description`
- [ ] Link to GitHub issue
- [ ] Summary of what changed and why
- [ ] Screenshots (for UI PRs)
- [ ] Confirmation: no secrets, no unrelated changes
- [ ] CI green (lint, typecheck, build, audit)

Use template: `.github/pull_request_template.md`

---

## 4. Code review focus

Reviewers check:

1. **Correctness** — Matches API Contract and issue AC
2. **Security** — [Coding Standards §6](./CODING_STANDARDS.md)
3. **Tenancy** — `merchantId` scoping on all queries
4. **Nomba** — `code === '00'` checks; webhook dedup
5. **Scope** — No features outside PRD §5.3

Approve only when all five pass.

---

## 5. Environment setup

See [LOCAL_SETUP.md](./LOCAL_SETUP.md). Day 1 checklist:

```bash
corepack enable && pnpm install
cp apps/web/.env.local.example apps/web/.env.local   # after Issue #2
cp apps/api/.env.example apps/api/.env
cp apps/ai-service/.env.example apps/ai-service/.env
```

---

## 6. Daily rhythm

| Time | Activity |
|---|---|
| Start | 15-min standup — board review, blockers |
| During | 1 issue In Progress per person max |
| Before merge | Pull latest `develop`, resolve conflicts |
| End | Push WIP branch; update issue if blocked |

---

## 7. Deployment

| Service | Platform | Trigger |
|---|---|---|
| `apps/web` | Vercel | Push to `develop` |
| `apps/api` | Railway | Push to `develop` |
| `apps/ai-service` | Railway | Push to `develop` |

Production deploy: Issue #29 on Day 3.

---

## 8. When blocked

1. Check issue **Depends on** — is prerequisite Done?
2. Check API Contract and Nomba Verified doc; ask project lead if still unclear
3. Check [Nomba docs](https://developer.nomba.com/llms.txt)
4. Post in team chat with: issue #, what you tried, error message
5. Do not start a different issue if blocked &lt; 2 hours — pair instead

---

## 9. Scope control

New feature idea → check [PRD §5.3](../product/NombaFlow_PRD_v2.md). If not Must Have or Should Have, create a **future** issue label and defer.
