# NombaFlow — Team Assignments (3-Person)

**Team:** Backend Developer · Full Stack Developer · AI Specialist

This maps the original 4-role plan (FS + FE + Designer + AI) to your actual team.

## Ownership summary

| Person | GitHub label | Primary issues | % of backlog |
|---|---|---|---|
| **Backend Developer** | `owner: backend` | #3, #5–#8, #11–#18, #25, #29–#30 | ~55% |
| **Full Stack Developer** | `owner: fullstack` | #1–#2, #9–#10, #19–#24, #31–#32 | ~35% |
| **AI Specialist** | `owner: ai` | #4, #15–#16 (support), #26–#28 | ~10% |

Designer and Frontend Engineer roles are absorbed by **Full Stack Developer**. UI Spec replaces Figma for hackathon scope.

## Day-by-day sequencing

### Day 1 — Foundation (parallel)

```
Backend:     #3 NestJS → #5 Prisma → #6 Auth API → #7 Nomba OAuth → #8 Webhooks
Full Stack:  #1 Monorepo → #2 Next.js → #9 Register/Login → #10 Onboarding
AI:          #4 FastAPI scaffold → start synthetic training data for dunning model
Both:        #11 CI (Backend leads, Full Stack reviews)
```

**Blockers:** #5 must complete before Backend starts #6–#8. #6 must complete before Full Stack finishes #9.

### Day 2 — Core Engine (parallel)

```
Backend:     #12 Plans → #13 Enrollment → #14 Scheduler → #16 Dunning → #17 Ajo → #18 Email → #25 Analytics
Full Stack:  #19 Dashboard → #20 Plans UI → #21 Enrollment → #22 Dunning badge → #23 Ajo → #24 Portal
AI:          #15 Dunning model → #26 Forecast → (start #27 churn if ahead)
```

**Integration point:** Backend #16 calls AI #15. Full Stack #22 depends on both.

### Day 3 — Polish & Ship

```
Backend:     #29 Deploy all services → #30 Seed demo data
Full Stack:  #31 UI polish → #32 Submission + demo rehearsal
AI:          #27 Churn → #28 NL insights (if time)
All:         Two timed demo rehearsals (Demo Script)
```

## Collaboration boundaries

| Task | Builds | Consumes |
|---|---|---|
| Nomba OAuth (#7) | Backend | Full Stack onboarding form (#10) |
| Webhook handler (#8) | Backend | Dunning (#16), Email (#18), Dashboard activity feed (#19) |
| Dunning model (#15) | AI | Dunning orchestration (#16) |
| Analytics API (#25) | Backend | Dashboard (#19), Forecast (#26) |
| Enrollment API (#13) | Backend | Enrollment UI (#21) |

## Standup format (15 min)

1. Board review — anything stuck >4 hours?
2. Each person: done yesterday, doing today, blockers
3. Confirm no one has >1 issue "In Progress"
4. Flag any doc conflicts to Full Stack (doc maintainer)

## Escalation

- **Nomba API questions:** Backend Developer checks [Nomba docs](https://developer.nomba.com/llms.txt) first, then Nomba developer Slack/Discord
- **Scope creep:** Check PRD §5.3 — if not Must Have, defer
- **Doc conflicts:** [Document Authority](../DOCUMENT_AUTHORITY.md)
