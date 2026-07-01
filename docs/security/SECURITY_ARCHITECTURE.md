# NombaFlow — Security Architecture

**Scope:** Hackathon-appropriate security that judges and production-minded reviewers will respect.

## Threat model (simplified)

| Threat | Mitigation |
|---|---|
| Forged Nomba webhooks | HMAC-SHA256 signature verification per [Nomba webhook docs](https://developer.nomba.com/docs/api-basics/webhook) |
| Stolen merchant credentials | AES-256-GCM encryption at rest; never log `clientSecret` or tokens |
| Cross-tenant data leak | Every query scoped by `merchantId`; integration tests for isolation |
| JWT theft | Short-lived access tokens (15 min); httpOnly cookies; refresh rotation |
| SQL injection | Prisma parameterized queries only |
| XSS | React auto-escaping; sanitize any rich text |
| CSRF | SameSite cookies; CORS restricted to frontend origin |
| Brute force login | Rate limit `/auth/login` (10 req/min per IP) |
| AI service abuse | `X-Internal-Secret` header; not exposed to public internet |
| Dependency vulnerabilities | `pnpm audit --audit-level=high` in CI |

## Nomba webhook verification

**Do not** verify by hashing the raw request body. Nomba signs a concatenated string:

```
{event_type}:{requestId}:{merchant.userId}:{merchant.walletId}:{transaction.transactionId}:{transaction.type}:{transaction.time}:{transaction.responseCode}:{nomba-timestamp}
```

Result is Base64-encoded HMAC-SHA256. Full implementation in [Nomba API Verified doc §3](./NombaFlow_Nomba_API_Verified.md).

## Credential storage

| Field | Storage | Notes |
|---|---|---|
| `nombaClientSecret` | Encrypted (`ENCRYPTION_KEY`) | Never returned to frontend |
| `nombaAccessToken` | Encrypted | Rotated every ~25 min |
| `nombaRefreshToken` | Encrypted | Used for token refresh |
| `nombaTokenKey` | Plaintext in DB | Not secret — it's a payment token reference, not card data |
| Merchant password | bcrypt hash | Cost factor 12 |

## Authentication flow

- **Merchants:** Email/password → JWT access + refresh tokens (NestJS)
- **Customers (portal):** Magic link or enrollment-session token (scope limited to own `customerId`)
- **AI service:** Internal shared secret only

## OWASP Top 10 mapping

| OWASP risk | NombaFlow control |
|---|---|
| A01 Broken Access Control | `merchantId` scoping, auth guards, RBAC (merchant admin only) |
| A02 Cryptographic Failures | TLS everywhere, AES-256-GCM for secrets, bcrypt passwords |
| A03 Injection | Prisma ORM, Zod validation on all inputs |
| A04 Insecure Design | Webhook dedup, idempotent charges (`X-Idempotent-key`) |
| A05 Security Misconfiguration | Helmet headers, no default credentials, env-based secrets |
| A06 Vulnerable Components | CI audit, Dependabot (enable on repo) |
| A07 Auth Failures | Token expiry, refresh rotation, MFA (post-hackathon) |
| A08 Integrity Failures | Webhook signature verification |
| A09 Logging Failures | Pino structured logs, Sentry for errors, audit trail on charges |
| A10 SSRF | AI service does not fetch arbitrary URLs; Nomba base URL allowlisted |

## Secrets management

| Environment | Storage |
|---|---|
| Local | `.env` files (gitignored) |
| Staging/Production | Railway + Vercel encrypted env vars |
| Team sharing | Password manager only — never Slack/email |

Run secret scan before submission (Issue #32):

```bash
git secrets --scan 2>/dev/null || grep -rE "(sk_|re_|sk-ant-|client_secret)" --include="*.ts" --include="*.tsx" --include="*.py" .
```

## Logging rules

**Never log:** passwords, `clientSecret`, `accessToken`, `refreshToken`, full webhook payloads in production (log `requestId` + `event_type` only).

**Always log:** charge attempts, webhook receipt, dunning decisions, payout status changes.

## Post-hackathon hardening (documented, not built)

- MFA for merchant accounts
- NestJS JWT with httpOnly cookie storage on Next.js (see [Architecture ADR-002](./engineering/ARCHITECTURE.md))
- WAF on API gateway
- PCI DSS scope review (Nomba handles card data — we never touch PAN)
