# NombaFlow — API Contract Document

**Purpose:** This document defines the exact shape of every request and response between our three services: the Next.js frontend, the NestJS backend, and the Python AI service. Nobody should guess a field name during the build. If a shape needs to change, update this document first, then tell the team in the group chat before changing code.

**Base URLs (update once deployed):**
- Backend API: `http://localhost:3001/api/v1` (local) → `https://api.nombaflow.com/v1` (production)
- AI Service: `http://localhost:8000` (local) → internal only, backend calls this, frontend never calls it directly

---

## 1. Conventions Used Throughout

- All request and response bodies are JSON
- All timestamps are ISO 8601 strings in UTC, e.g. `"2026-07-01T09:30:00Z"`
- All money amounts are sent as strings to avoid floating point errors, e.g. `"35000.00"`, not `35000`
- All IDs are strings (cuid format), e.g. `"cltz9k2x10001abc"`
- Every error response follows the same shape, shown in Section 8
- Authenticated routes require header: `Authorization: Bearer <access_token>`

---

## 2. Auth Endpoints

### POST /auth/register

Request:
```json
{
  "businessName": "Greenfield Academy",
  "email": "adaeze@greenfieldacademy.com",
  "password": "minimum8characters"
}
```

Response (201):
```json
{
  "merchant": {
    "id": "cltz9k2x10001abc",
    "businessName": "Greenfield Academy",
    "email": "adaeze@greenfieldacademy.com",
    "createdAt": "2026-07-01T09:30:00Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### POST /auth/login

Request:
```json
{
  "email": "adaeze@greenfieldacademy.com",
  "password": "minimum8characters"
}
```

Response (200): same shape as register response above.

### POST /auth/refresh

Request:
```json
{ "refreshToken": "eyJhbGc..." }
```

Response (200):
```json
{ "accessToken": "eyJhbGc..." }
```

---

## 3. Merchant Settings

### POST /merchants/me/nomba-credentials

Connects the merchant's Nomba account via OAuth 2.0 client credentials. The backend calls `POST /v1/auth/token/issue` to validate credentials before saving. Raw `clientSecret` is never returned to the frontend after this call.

Request:
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "accountId": "01a10aeb-d989-460a-bbde-9842f2b4320f"
}
```

Response (200):
```json
{
  "connected": true,
  "merchantId": "cltz9k2x10001abc",
  "validatedAt": "2026-07-01T09:31:00Z"
}
```

Response (422, credentials invalid):
```json
{
  "error": {
    "code": "INVALID_NOMBA_CREDENTIALS",
    "message": "We could not validate these credentials with Nomba. Double check your Client ID, Client Secret, and Account ID.",
    "requestId": "req_01HX2K9F",
    "timestamp": "2026-07-01T09:31:00Z"
  }
}
```

### GET /merchants/me

Response (200):
```json
{
  "id": "cltz9k2x10001abc",
  "businessName": "Greenfield Academy",
  "email": "adaeze@greenfieldacademy.com",
  "nombaConnected": true,
  "createdAt": "2026-07-01T09:30:00Z"
}
```

---

## 4. Plans

### POST /plans

Request:
```json
{
  "name": "JSS1 Term Fees",
  "description": "Termly tuition for JSS1 students",
  "amount": "35000.00",
  "currency": "NGN",
  "interval": "MONTHLY",
  "intervalCount": 1,
  "maxCycles": 3,
  "planType": "STANDARD",
  "trialDays": 0
}
```

Valid values:
- `interval`: `"WEEKLY"` | `"MONTHLY"` | `"QUARTERLY"` | `"ANNUALLY"`
- `planType`: `"STANDARD"` | `"AJO"`
- `maxCycles`: integer, or `null` for unlimited

Response (201):
```json
{
  "id": "plan_8x2k9f001",
  "merchantId": "cltz9k2x10001abc",
  "name": "JSS1 Term Fees",
  "description": "Termly tuition for JSS1 students",
  "amount": "35000.00",
  "currency": "NGN",
  "interval": "MONTHLY",
  "intervalCount": 1,
  "maxCycles": 3,
  "planType": "STANDARD",
  "status": "ACTIVE",
  "enrollmentLink": "https://nombaflow.com/enroll/plan_8x2k9f001",
  "createdAt": "2026-07-01T09:35:00Z"
}
```

### GET /plans

Response (200):
```json
{
  "plans": [
    {
      "id": "plan_8x2k9f001",
      "name": "JSS1 Term Fees",
      "amount": "35000.00",
      "interval": "MONTHLY",
      "status": "ACTIVE",
      "activeSubscriberCount": 4
    }
  ]
}
```

### GET /plans/:id

Returns full plan detail, same shape as the POST response above, plus a `subscribers` summary:
```json
{
  "id": "plan_8x2k9f001",
  "name": "JSS1 Term Fees",
  "amount": "35000.00",
  "interval": "MONTHLY",
  "status": "ACTIVE",
  "subscribers": {
    "active": 4,
    "pastDue": 1,
    "cancelled": 0
  }
}
```

---

## 5. Customer Enrollment

### POST /customers/enroll

Called from the public enrollment page when a customer submits their details, before redirecting to Nomba Checkout.

Request:
```json
{
  "planId": "plan_8x2k9f001",
  "name": "Funmi Okoro",
  "email": "funmi.okoro@gmail.com",
  "phone": "+2348012345678"
}
```

Response (200):
```json
{
  "customerId": "cust_4f9d2k001",
  "checkoutLink": "https://checkout.nomba.com/pay/783888998",
  "orderReference": "90e81e8a-bc14-4ebf-89c0-57da752cca58"
}
```

The frontend redirects the browser to `checkoutLink`. After checkout, Nomba redirects to `callbackUrl` with `orderReference` appended. Enrollment confirmation (token capture and subscription creation) comes through the `payment_success` webhook (Section 11), not a direct API callback.

### GET /customers/:id/portal

Returns what the customer self-service portal needs to render.

Response (200):
```json
{
  "customer": {
    "id": "cust_4f9d2k001",
    "name": "Funmi Okoro",
    "email": "funmi.okoro@gmail.com"
  },
  "subscription": {
    "id": "sub_7h3j1k001",
    "planName": "JSS1 Term Fees",
    "amount": "35000.00",
    "status": "ACTIVE",
    "nextBillingDate": "2026-08-01T00:00:00Z",
    "cyclesCompleted": 1,
    "cyclesTotal": 3
  },
  "chargeHistory": [
    {
      "id": "charge_9k2x1001",
      "amount": "35000.00",
      "status": "SUCCESS",
      "chargedAt": "2026-07-01T09:40:00Z"
    }
  ]
}
```

---

## 6. Subscriptions

### GET /subscriptions

Query params: `?status=ACTIVE&planId=plan_8x2k9f001`

Response (200):
```json
{
  "subscriptions": [
    {
      "id": "sub_7h3j1k001",
      "customerName": "Funmi Okoro",
      "customerEmail": "funmi.okoro@gmail.com",
      "planName": "JSS1 Term Fees",
      "status": "ACTIVE",
      "nextBillingDate": "2026-08-01T00:00:00Z",
      "totalPaid": "35000.00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 4
  }
}
```

### POST /subscriptions/:id/cancel

Response (200):
```json
{
  "id": "sub_7h3j1k001",
  "status": "CANCELLED",
  "cancelledAt": "2026-07-01T10:00:00Z"
}
```

### POST /subscriptions/:id/pause

Response (200):
```json
{
  "id": "sub_7h3j1k001",
  "status": "PAUSED",
  "pausedAt": "2026-07-01T10:00:00Z"
}
```

---

## 7. Analytics

### GET /analytics/overview

Powers the main merchant dashboard numbers. Called on every dashboard load and polled every 30 seconds during the demo.

Response (200):
```json
{
  "mrr": "165000.00",
  "activeSubscribers": 8,
  "failedPaymentsCount": 1,
  "failedPaymentsAmount": "35000.00",
  "churnedThisMonth": 0,
  "upcomingCharges": {
    "next7Days": "70000.00",
    "next30Days": "165000.00"
  },
  "revenueThisMonth": "165000.00",
  "revenueLastMonth": "130000.00"
}
```

### GET /analytics/forecast/:merchantId

Powers the 90-day cash flow forecast chart on the dashboard. The backend calls the AI service internally and returns the result.

Response (200):
```json
{
  "merchantId": "cltz9k2x10001abc",
  "generatedAt": "2026-07-01T10:00:00Z",
  "forecast": {
    "next30Days": "140000.00",
    "next60Days": "245000.00",
    "next90Days": "315000.00"
  },
  "atRiskAmount": "35000.00",
  "chartData": [
    { "date": "2026-07-01", "expected": "165000.00", "collected": "165000.00" },
    { "date": "2026-08-01", "expected": "140000.00", "collected": null },
    { "date": "2026-09-01", "expected": "105000.00", "collected": null },
    { "date": "2026-10-01", "expected": "95000.00", "collected": null }
  ]
}
```

`collected` is `null` for future dates, the frontend renders those as projected bars in a different color.

---

## 8. Ajo Groups

### POST /ajo-groups

Request:
```json
{
  "name": "Osusu Circle",
  "contributionAmount": "10000.00",
  "frequency": "WEEKLY",
  "members": [
    { "name": "Chioma Eze", "email": "chioma@gmail.com", "phone": "+2348011111111", "position": 1 },
    { "name": "Tunde Bello", "email": "tunde@gmail.com", "phone": "+2348022222222", "position": 2 },
    { "name": "Amaka Obi", "email": "amaka@gmail.com", "phone": "+2348033333333", "position": 3 }
  ]
}
```

`position` is the member's turn in the rotation order starting at 1.

Response (201):
```json
{
  "id": "ajo_2k9x1f001",
  "merchantId": "cltz9k2x10001abc",
  "name": "Osusu Circle",
  "contributionAmount": "10000.00",
  "frequency": "WEEKLY",
  "totalRounds": 3,
  "currentRound": 0,
  "status": "ACTIVE",
  "enrollmentLink": "https://nombaflow.com/enroll/ajo/ajo_2k9x1f001",
  "members": [
    { "id": "ajomember_001", "customerId": null, "name": "Chioma Eze", "email": "chioma@gmail.com", "position": 1, "status": "PENDING_ENROLLMENT" },
    { "id": "ajomember_002", "customerId": null, "name": "Tunde Bello", "email": "tunde@gmail.com", "position": 2, "status": "PENDING_ENROLLMENT" },
    { "id": "ajomember_003", "customerId": null, "name": "Amaka Obi", "email": "amaka@gmail.com", "position": 3, "status": "PENDING_ENROLLMENT" }
  ],
  "createdAt": "2026-07-01T09:35:00Z"
}
```

### GET /ajo-groups

Response (200):
```json
{
  "ajoGroups": [
    {
      "id": "ajo_2k9x1f001",
      "name": "Osusu Circle",
      "contributionAmount": "10000.00",
      "frequency": "WEEKLY",
      "currentRound": 1,
      "totalRounds": 3,
      "status": "ACTIVE",
      "enrolledMemberCount": 3,
      "currentBeneficiary": "Tunde Bello"
    }
  ]
}
```

### GET /ajo-groups/:id

Response (200):
```json
{
  "id": "ajo_2k9x1f001",
  "name": "Osusu Circle",
  "contributionAmount": "10000.00",
  "frequency": "WEEKLY",
  "currentRound": 2,
  "totalRounds": 3,
  "status": "ACTIVE",
  "members": [
    { "id": "ajomember_001", "name": "Chioma Eze", "position": 1, "status": "ACTIVE", "contributedThisRound": true },
    { "id": "ajomember_002", "name": "Tunde Bello", "position": 2, "status": "ACTIVE", "contributedThisRound": true },
    { "id": "ajomember_003", "name": "Amaka Obi", "position": 3, "status": "ACTIVE", "contributedThisRound": false }
  ],
  "currentBeneficiary": {
    "memberId": "ajomember_002",
    "name": "Tunde Bello",
    "payoutAmount": "30000.00",
    "payoutStatus": "PENDING"
  },
  "rounds": [
    { "roundNumber": 1, "beneficiaryName": "Chioma Eze", "payoutStatus": "COMPLETE", "payoutDate": "2026-06-24T10:00:00Z" },
    { "roundNumber": 2, "beneficiaryName": "Tunde Bello", "payoutStatus": "PENDING", "payoutDate": null }
  ]
}
```

---

## 9. Subscriptions — Extended (Dunning Badge Fields)

The subscription list endpoint in Section 6 returns summary data. When the Full Stack Developer builds the subscription detail page and the dunning retry badge, they need these additional fields. This is what `GET /subscriptions/:id` returns:

```json
{
  "id": "sub_7h3j1k001",
  "customerId": "cust_4f9d2k001",
  "customerName": "Funmi Okoro",
  "customerEmail": "funmi.okoro@gmail.com",
  "planName": "JSS1 Term Fees",
  "amount": "35000.00",
  "status": "PAST_DUE",
  "nextBillingDate": "2026-08-01T00:00:00Z",
  "cyclesCompleted": 1,
  "cyclesTotal": 3,
  "totalPaid": "35000.00",
  "dunning": {
    "active": true,
    "attemptNumber": 1,
    "lastFailureCode": "insufficient_funds",
    "lastFailedAt": "2026-07-01T09:40:00Z",
    "nextRetryAt": "2026-07-03T09:00:00Z",
    "aiConfidenceScore": 0.71,
    "aiReasoning": "Customer charges cluster around the 1st to 3rd of the month. Retrying after typical fund availability window."
  },
  "chargeHistory": [
    { "id": "charge_001", "amount": "35000.00", "status": "SUCCESS", "chargedAt": "2026-06-01T09:40:00Z" },
    { "id": "charge_002", "amount": "35000.00", "status": "FAILED", "failureCode": "insufficient_funds", "chargedAt": "2026-07-01T09:40:00Z" }
  ]
}
```

The `dunning` object is `null` when status is `ACTIVE`. The Full Stack Developer renders the retry badge only when `dunning.active === true`.

---

## 10. Customer Card Update

### PATCH /customers/:id/card

Called from the customer self-service portal when a customer wants to update their saved card.

Request: no body required, just the authenticated customer session.

Response (200):
```json
{
  "checkoutLink": "https://checkout.nomba.com/pay/update_xyz456",
  "orderReference": "nf_update_4f9d2k001"
}
```

The frontend redirects the customer to `checkoutLink`. After completion, Nomba fires `payment_success` with updated `tokenizedCardData.tokenKey`; the backend replaces the stored `nombaTokenKey`.

---

## 11. Webhooks (Nomba calling us)

### POST /webhooks/nomba

This is Nomba calling our backend, not the frontend calling anything. Listed here so everyone understands what triggers state changes in the system.

**Authoritative reference:** [Nomba Webhooks](https://developer.nomba.com/docs/api-basics/webhook) and `NombaFlow_Nomba_API_Verified.md`.

Headers Nomba sends:
```
nomba-signature: <base64 HMAC-SHA256>
nomba-sig-value: <same as nomba-signature>
nomba-signature-algorithm: HmacSHA256
nomba-signature-version: 1.0.0
nomba-timestamp: 2023-03-31T05:56:47Z
```

Signature verification uses a concatenated string (not raw body). See Nomba Verified doc Correction 3.

**Supported event types:** `payment_success`, `payment_failed`, `payout_success`, `payout_failed`, `payment_reversal`, `payout_refund`. There is no `checkout.completed` event.

Example payload, payment success (enrollment or recurring charge):
```json
{
  "event_type": "payment_success",
  "requestId": "49e11b44-909b-4f83-82b4-9a83aXXXXXX",
  "data": {
    "merchant": {
      "walletId": "693e907aad9ea59616XXXX",
      "walletBalance": 539.4,
      "userId": "613bb620-c8e5-45f6-9c00-XXXXXXXX"
    },
    "transaction": {
      "transactionId": "API-VACT_TRA-613BB-eeae578a-cdd4-459c-8bd5-XXXXXX",
      "type": "card_payment",
      "transactionAmount": 35000,
      "time": "2026-07-01T09:40:00Z",
      "responseCode": ""
    },
    "tokenizedCardData": {
      "tokenKey": "7628788443",
      "cardType": "Visa",
      "cardPan": "4***45**** ****111*"
    }
  }
}
```

Example payload, payment failed:
```json
{
  "event_type": "payment_failed",
  "requestId": "76a7df87-4819-493c-90ee-XXXXXXX",
  "data": {
    "merchant": { "userId": "613bb620-c8e5-45f6-9c00-XXXXXXXX" },
    "transaction": {
      "transactionId": "API-CARD-xxx",
      "type": "card_payment",
      "transactionAmount": 35000,
      "time": "2026-07-01T09:40:00Z",
      "responseCode": "51"
    }
  }
}
```

Example payload, payout success (ajo group payout):
```json
{
  "event_type": "payout_success",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "data": {
    "merchant": { "userId": "613bb620-c8e5-45f6-9c00-XXXXXXXX" },
    "transaction": {
      "transactionId": "API-TRANSFER-xxx",
      "type": "transfer",
      "transactionAmount": 30000,
      "time": "2026-07-01T10:00:00Z"
    }
  }
}
```

**Deduplication:** use `requestId` (camelCase in webhook JSON payload; Nomba docs table also references `request_id`) as `nombaEventId` in WebhookEvent table. Nomba retries failed deliveries up to 5 times with exponential backoff (2 min → ~53 min).

**Our response to Nomba:** return `200 OK` immediately, then process asynchronously via BullMQ. Never block the webhook handler on database or AI calls.

**Enrollment flow:** on first `payment_success` for an enrollment `orderReference`, extract `tokenizedCardData.tokenKey`, update `Customer.nombaTokenKey`, create `Subscription` with status `ACTIVE`.

---

## 12. Backend → AI Service Contract

The AI service is internal only. The NestJS backend calls it; the frontend never sees these endpoints directly.

### POST /predict-retry

Called by the backend when a charge fails, to get the recommended retry time.

Request:
```json
{
  "customerId": "cust_4f9d2k001",
  "subscriptionId": "sub_7h3j1k001",
  "failureCode": "insufficient_funds",
  "failedAt": "2026-07-01T09:40:00Z",
  "paymentHistory": [
    { "chargedAt": "2026-06-01T09:40:00Z", "status": "SUCCESS" },
    { "chargedAt": "2026-05-01T09:40:00Z", "status": "SUCCESS" }
  ]
}
```

Response (200):
```json
{
  "recommendedRetryAt": "2026-07-03T09:00:00Z",
  "confidenceScore": 0.71,
  "reasoning": "Customer's previous successful charges cluster around the 1st to 3rd of the month, suggesting salary timing. Recommending retry after typical fund availability window."
}
```

If the AI service has insufficient history for a new customer, it falls back to a default:
```json
{
  "recommendedRetryAt": "2026-07-04T09:40:00Z",
  "confidenceScore": 0.3,
  "reasoning": "Insufficient payment history for this customer. Using default 72 hour retry window."
}
```

### GET /forecast/:merchantId

Response (200):
```json
{
  "merchantId": "cltz9k2x10001abc",
  "generatedAt": "2026-07-01T10:00:00Z",
  "forecast": {
    "next30Days": "140000.00",
    "next60Days": "245000.00",
    "next90Days": "315000.00"
  },
  "atRiskAmount": "35000.00"
}
```

### POST /insights/ask

Request:
```json
{
  "merchantId": "cltz9k2x10001abc",
  "question": "Why did my revenue drop this month?"
}
```

Response (200):
```json
{
  "answer": "Your revenue dropped by 12,000 naira compared to last month. The main reason was two subscription cancellations from your JSS1 plan, both after repeated failed charges. Catching those earlier with a retry could have kept around 24,000 naira active."
}
```

---

## 13. Error Response Standard (applies to every endpoint)

```json
{
  "error": {
    "code": "SUBSCRIPTION_NOT_FOUND",
    "message": "No subscription found with this ID.",
    "requestId": "req_01HX2K9F",
    "timestamp": "2026-07-01T10:05:00Z"
  }
}
```

Common error codes to standardize on across the team:

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Authenticated but not allowed to access this resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `INVALID_NOMBA_CREDENTIALS` | 422 | Nomba OAuth credentials failed validation |
| `DUPLICATE_CUSTOMER` | 409 | Customer email already enrolled in this plan |
| `NOMBA_API_ERROR` | 502 | Nomba's API returned an error we could not recover from |
| `RATE_LIMITED` | 429 | Too many requests, slow down |

---

## 14. What Each Team Member Needs to Build Against This Document

- **Full Stack Developer:** build every form and dashboard view against the exact request and response shapes in Sections 2–10. If a field is missing here, ask before assuming.
- **Backend Developer:** implement these endpoints exactly as specified, including the error shape in Section 13 on every single endpoint, no exceptions.
- **AI Specialist:** the AI service only needs to implement Section 12. It never talks to the frontend or to Nomba directly.

---

*If any endpoint shape changes during the build, edit this document first and post in the team chat before changing code. Two people building against two different versions of the same endpoint is the most common way hackathon teams lose hours on Day 2.*
