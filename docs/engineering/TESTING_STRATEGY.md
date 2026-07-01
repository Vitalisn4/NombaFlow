# NombaFlow — Testing Strategy

**Scope:** Hackathon-quality testing — enough to ship confidently, not enterprise QA coverage.

## Test layers

| Layer | Owner | Tool | When |
|---|---|---|---|
| Unit | Backend | Jest | Service logic, webhook signature verification |
| Integration | Backend | Supertest + Prisma test DB | API endpoints, Nomba client wrapper (mocked) |
| AI model | AI Specialist | pytest | Dunning predictor, forecast endpoint |
| E2E | Full Stack | Playwright (if time) | Register → connect Nomba → create plan → enroll |
| Manual | All | Nomba sandbox | Demo rehearsal, live charge/fail scenarios |

## Nomba sandbox test matrix

Run before every demo rehearsal. Source: [Nomba testing docs](https://developer.nomba.com/docs/api-basics/testing).

| Scenario | Nomba API | Expected webhook | NombaFlow outcome |
|---|---|---|---|
| Successful enrollment checkout | `POST /v1/checkout/order` + `tokenizeCard: true` | `payment_success` with `tokenizedCardData` | Customer `nombaTokenKey` saved, subscription ACTIVE |
| Successful recurring charge | `POST /v1/checkout/tokenized-card-payment` | `payment_success` | Charge SUCCESS, `nextBillingDate` advanced |
| Failed recurring charge | Tokenized charge with decline test card | `payment_failed` | Charge FAILED, subscription PAST_DUE, dunning triggered |
| Duplicate webhook | Resend same `requestId` | Same event twice | Second event ignored (dedup) |
| Invalid webhook signature | Manual POST with bad signature | N/A | Logged warning, no state change |
| Ajo bank payout | `POST /v2/transfers/bank` | `payout_success` | AjoPayout COMPLETE, round advances |
| OAuth token refresh | Wait 25+ min or force expiry | N/A | Background job refreshes token before expiry |

## Critical unit tests (Backend — Day 1/2)

```typescript
// Must-have tests before demo
describe('verifyNombaWebhook', () => {
  it('accepts valid signature from Nomba concatenated payload');
  it('rejects tampered signature');
  it('handles responseCode "null" as empty string');
});

describe('NombaClient', () => {
  it('throws when response.code !== "00"');
  it('refreshes token when expiresAt is within 5 minutes');
});
```

## API contract tests

For each endpoint in [API Contract](./NombaFlow_API_Contract_v2.md), verify:

- Happy path returns documented shape
- Validation errors return standard error envelope (Section 13)
- Cross-merchant access returns `403 FORBIDDEN`

## AI service tests

```python
def test_predict_retry_returns_fallback_for_new_customer():
    # < 3 payment history → 72h retry, confidence 0.3

def test_predict_retry_under_500ms():
    # Performance requirement from GitHub Issue #15
```

## E2E demo path (manual checklist)

- [ ] Merchant registers and connects Nomba credentials
- [ ] Merchant creates plan, copies enrollment link
- [ ] Customer enrolls, completes Nomba Checkout
- [ ] Dashboard shows new subscriber within 30s (webhook + poll)
- [ ] Manual trigger or scheduler fires charge
- [ ] Failed charge shows dunning badge with AI reasoning
- [ ] Ajo group: 3 members enroll, contribution day charges all, payout fires

## Demo safety fallback

Per PRD open questions: hidden keyboard shortcut triggers "simulate webhook" for demo recovery. Never show to judges unless live Nomba delivery fails.

## CI pipeline (Issue #11)

On every PR to `develop`:

```yaml
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
- run: pnpm install --frozen-lockfile
- run: pnpm run lint && pnpm run typecheck && pnpm run build  # web + api via root scripts
- run: pnpm audit --audit-level=high
```
- pytest apps/ai-service/tests/  # when tests exist
```

## Out of scope for hackathon

- Load testing beyond 50 concurrent users
- Penetration testing
- Multi-region failover tests
