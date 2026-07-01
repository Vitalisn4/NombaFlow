# NombaFlow — Coding Standards

**Applies to:** all code in `apps/` and `packages/`.  
**Enforced by:** PR review + CI (lint, typecheck, audit).

---

## 1. General principles

1. **Read the contract first** — API shapes live in [API Contract](./NombaFlow_API_Contract_v2.md). Do not invent fields.
2. **Small PRs** — One issue per PR. Target &lt; 400 lines changed.
3. **No secrets in code** — Environment variables only. Never commit `.env`.
4. **No drive-by refactors** — Change only what the issue requires.
5. **Money is never a float** — Use `Decimal` / string amounts only.

---

## 2. TypeScript (NestJS + Next.js)

### Naming

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `nomba-client.service.ts` |
| Classes | PascalCase | `NombaClientService` |
| Functions/vars | camelCase | `handlePaymentSuccess` |
| Constants | SCREAMING_SNAKE | `MAX_DUNNING_ATTEMPTS` |
| DB enums | SCREAMING_SNAKE | `PAST_DUE` (Prisma enum) |

### Structure (NestJS)

```typescript
// Controller: HTTP only
@Post()
create(@Body() dto: CreatePlanDto, @MerchantId() merchantId: string) {
  return this.plansService.create(merchantId, dto);
}

// Service: business logic
// Repository/Prisma: data access — always filter by merchantId
```

### Validation

- **All** request bodies validated with **Zod** (or class-validator matching API Contract)
- Return errors using standard shape from API Contract §13

### Error handling

```typescript
// Nomba API — always check code field
const result = await this.nombaClient.post(...);
if (result.code !== '00') {
  throw new NombaApiError(result.code, result.description);
}
```

### Imports

- Use `@nombaflow/database` for Prisma client (after Issue #5)
- Use `@nombaflow/types` for shared DTOs
- No circular imports between modules

---

## 3. Python (FastAPI)

- **Type hints** on all function signatures
- **Pydantic** models for request/response — mirror API Contract §12
- No Nomba API calls from AI service
- Keep endpoints &lt; 100 lines; extract model logic to `services/`

---

## 4. Database (Prisma)

- Schema changes require updating [Database Schema doc](./NombaFlow_Database_Schema.md) **in the same PR**
- Migrations named descriptively: `add_dunning_attempts`, not `migration1`
- Never raw SQL unless Prisma cannot express it (document why in PR)
- **Every** merchant-data query includes `where: { merchantId }`

---

## 5. Frontend (Next.js)

- **Server Components** by default; `'use client'` only when needed (forms, charts, polling)
- Fetch from `NEXT_PUBLIC_API_URL` — never call AI service from browser
- Match [UI Spec](../product/NombaFlow_UI_Spec.md) tokens and screen behavior exactly
- Loading skeletons max 2 seconds before content or error state
- Mobile-first for enrollment and customer portal (375px minimum)

---

## 6. Security requirements (every PR)

- [ ] No `console.log` of secrets, tokens, or full webhook payloads
- [ ] User input validated before DB or external API calls
- [ ] New endpoints behind auth guard unless explicitly public
- [ ] `merchantId` from JWT, never trusted from client body alone

---

## 7. Testing expectations

| Change type | Minimum test |
|---|---|
| Webhook signature | Unit test with Nomba sample payload |
| Nomba client wrapper | Unit test for `code !== '00'` handling |
| Auth endpoints | Integration test: register → login → protected route |
| AI endpoint | pytest: response shape + &lt; 500ms |
| UI screen | Manual check against UI Spec acceptance criteria |

See [Testing Strategy](./TESTING_STRATEGY.md).

---

## 8. Comments

Write comments only for:

- Non-obvious business rules (e.g. "Nomba retries webhooks 5× — dedup required")
- Security-sensitive code paths

Do **not** comment obvious code.

---

## 9. Git commit messages

```
type(scope): imperative summary

feat(api): add nomba oauth credential endpoint
fix(webhooks): verify signature with nomba-timestamp
chore(ci): add pnpm audit to pipeline
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
