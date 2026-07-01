# NombaFlow — Nomba API Verified Integration Guide

**Purpose:** This document corrects every inaccuracy in the previous documents that was written from assumption rather than the actual Nomba developer documentation. Every section here is sourced directly from https://developer.nomba.com. Your Backend Developer should treat this as the authoritative reference over anything in the earlier documents when there is a conflict.

---

## 1. CRITICAL CORRECTIONS (Things That Were Wrong Before)

These are not small differences. If you build against the old versions, your code will not work.

---

### Correction 1 — Nomba Authentication Is OAuth 2.0, Not an API Key Header

**What the documents said:**
The API Contract and environment variables document said merchants paste a "Nomba API key" and we validate it by sending it in an `Authorization: Bearer` header.

**What Nomba's docs actually say:**
Nomba uses OAuth 2.0 with `client_id` and `client_secret` to obtain an `access_token`. The token expires after 30 minutes and must be refreshed using a `refresh_token`.

**The actual authentication flow:**

```javascript
// Step 1: Obtain access token
const response = await fetch('https://api.nomba.com/v1/auth/token/issue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'accountId': merchantAccountId,
  },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: merchantClientId,
    client_secret: merchantClientSecret,
  }),
});

const { code, data } = await response.json();
// code === "00" means success (NOT HTTP 200 alone)
const { access_token, refresh_token, expiresAt } = data;

// Step 2: Use access_token in all API calls
headers: {
  'Authorization': `Bearer ${access_token}`,
  'accountId': merchantAccountId,
  'Content-Type': 'application/json',
}

// Step 3: Refresh before expiry (refresh 5 minutes before expiresAt)
const refresh = await fetch('https://api.nomba.com/v1/auth/token/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
    'accountId': merchantAccountId,
  },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
  }),
});
```

**What this changes in NombaFlow's architecture:**

When a merchant "connects their Nomba account" on NombaFlow, they provide their `client_id`, `client_secret`, and `accountId` — not a single API key. NombaFlow then:
1. Calls Nomba auth to get an `access_token` and `refresh_token`
2. Stores the `refresh_token` encrypted in the database (never the raw `client_secret` if avoidable)
3. Uses a background job to refresh the token 5 minutes before `expiresAt`
4. All Nomba API calls use the current valid `access_token`

**Update needed in:**
- Database schema: the `Merchant` model needs `nombaClientId`, `nombaClientSecret` (encrypted), `nombaAccountId`, `nombaAccessToken`, `nombaRefreshToken`, `nombaTokenExpiresAt` instead of just `nombaApiKey`
- API Contract: the `POST /merchants/me/nomba-key` endpoint becomes `POST /merchants/me/nomba-credentials` accepting `clientId`, `clientSecret`, `accountId`
- Environment variables: remove `NOMBA_API_KEY`, replace with `NOMBA_BASE_URL` only (merchant credentials stored per-merchant in DB)

---

### Correction 2 — Nomba Response Format Is Always `{ code, description, data }`

**What the documents said:**
The API Contract and error handling sections assumed standard HTTP status codes alone indicate success.

**What Nomba's docs actually say:**
Every Nomba response follows this structure:

```json
{
  "code": "00",
  "description": "Success",
  "data": { ... }
}
```

A `200 HTTP` status does NOT mean success. You must check `code === "00"` for every response. Any other code is an error. The `description` field explains what went wrong.

**Code reference:**
- `"00"` — Success
- `"01"` — Generic error, retryable
- `"02"` — Validation error, do not retry
- `"05"` — Transaction not permitted
- `"06"` — Error, do not retry

**What this changes:**
Every Nomba API call in the NestJS backend must check `result.code !== '00'` and throw accordingly. Never trust the HTTP status alone.

```typescript
// Correct pattern for every Nomba API call
const result = await nombaClient.post('/checkout/order', payload);
if (result.code !== '00') {
  throw new NombaApiError(result.code, result.description);
}
return result.data;
```

---

### Correction 3 — Webhook Signature Is Not Simple HMAC of Payload

**What the documents said:**
The documents said to verify webhooks by computing `HMAC-SHA256` of the raw request body.

**What Nomba's docs actually say:**
Nomba's signature is computed from a specific concatenated string of fields, NOT the raw payload body. The string format is:

```
{event_type}:{requestId}:{merchant.userId}:{merchant.walletId}:{transaction.transactionId}:{transaction.type}:{transaction.time}:{transaction.responseCode}:{nomba-timestamp header}
```

The result is Base64-encoded (not hex). The header name is `nomba-signature` (not `X-Nomba-Signature`).

**The correct verification function in Node.js:**

```typescript
import crypto from 'crypto';

function verifyNombaWebhook(payload: any, nombaSignature: string, nombaTimestamp: string, secret: string): boolean {
  const data = payload.data || {};
  const merchant = data.merchant || {};
  const transaction = data.transaction || {};

  const eventType = payload.event_type || '';
  const requestId = payload.requestId || '';
  const userId = merchant.userId || '';
  const walletId = merchant.walletId || '';
  const transactionId = transaction.transactionId || '';
  const transactionType = transaction.type || '';
  const transactionTime = transaction.time || '';
  let responseCode = transaction.responseCode || '';
  
  if (responseCode === 'null') responseCode = '';

  const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${responseCode}:${nombaTimestamp}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(hashingPayload);
  const computed = hmac.digest('base64');

  return nombaSignature.toLowerCase() === computed.toLowerCase();
}

// In the webhook controller:
const nombaSignature = req.headers['nomba-signature'] as string;
const nombaTimestamp = req.headers['nomba-timestamp'] as string;
const isValid = verifyNombaWebhook(req.body, nombaSignature, nombaTimestamp, process.env.NOMBA_WEBHOOK_SECRET);
if (!isValid) throw new UnauthorizedException('Invalid webhook signature');
```

**Other webhook headers to read:**
```
nomba-signature: <base64 hmac>
nomba-sig-value: <same as nomba-signature>
nomba-signature-algorithm: HmacSHA256
nomba-signature-version: 1.0.0
nomba-timestamp: 2023-03-31T05:56:47Z
```

---

### Correction 4 — Webhook Event Names Use Underscore, Not Dot

**What the documents said:**
The documents used `payment.success`, `payment.failed`, `transfer.success`, `checkout.completed`.

**What Nomba's docs actually say:**
The actual event names are:
- `payment_success`
- `payment_failed`
- `payout_success`
- `payout_failed`
- `payment_reversal`
- `payout_refund`

There is no `checkout.completed` event. The tokenised card data is returned inside the `payment_success` webhook under `data.tokenizedCardData.tokenKey`.

**Update every reference in every document that mentions webhook event names.**

---

### Correction 5 — Tokenised Card Field Is `tokenKey`, Not `token_id`

**What the documents said:**
The database schema and API contract used `nombaTokenId` and `token_id`.

**What Nomba's docs actually say:**
When `tokenizeCard: true` is set on a checkout order and the payment succeeds, the webhook payload includes:

```json
"tokenizedCardData": {
  "tokenKey": "7628788443",
  "cardType": "Visa",
  "tokenExpiryYear": "N/A",
  "tokenExpiryMonth": "N/A",
  "cardPan": "4***45**** ****111*"
}
```

The field is `tokenKey`. To charge a tokenised card:

```bash
POST /v1/checkout/tokenized-card-payment

{
  "order": {
    "orderReference": "unique-reference-here",
    "customerId": "your-customer-id",
    "callbackUrl": "https://nombaflow.com/webhooks/callback",
    "customerEmail": "customer@email.com",
    "amount": "35000.00",
    "currency": "NGN",
    "accountId": "merchant-nomba-account-id"
  },
  "tokenKey": "7628788443"
}
```

**Update needed:**
- Database schema: rename `nombaTokenId` to `nombaTokenKey` on the `Customer` model
- All code that stores or uses the tokenised card reference uses `tokenKey`

---

### Correction 6 — Virtual Accounts Route Is `/v1/accounts/virtual`, Not a Separate API

**What the documents said:**
Referenced a "Virtual Account API" as a separate product.

**What Nomba's docs actually say:**
Virtual accounts are created at `POST /v1/accounts/virtual` and require:
- `accountRef` (required) — unique reference you assign
- `accountName` (required)
- `currency` (required, use "NGN")
- `bvn` (optional)
- `expectedAmount` (optional, restricts to exact amount — be careful with this)
- `expiryDate` (optional, omit for permanent static account)

For NombaFlow's ajo groups and per-customer accounts, use **static virtual accounts** (no `expiryDate`). Do not set `expectedAmount` on subscription virtual accounts since the amount could vary.

Important limits from the docs:
- Each user can create a maximum of 2 virtual accounts in sandbox
- Sandbox transfers are capped at ₦150

**Production behavior is different from sandbox.** Plan your demo accordingly.

---

### Correction 7 — Webhook Retry Behavior Is Exponential Backoff Over 5 Retries

**What the documents said:**
The documents said Nomba retries webhooks if we return anything other than 200.

**What Nomba's docs actually say:**
Nomba retries failed webhooks using exponential backoff, up to 5 additional attempts after the first failure:

| Retry | Wait Time |
|---|---|
| 1 | 2 minutes |
| 2 | ~5 minutes |
| 3 | ~11 minutes |
| 4 | 24 minutes |
| 5 | ~53 minutes |

Both 4XX and 5XX trigger retries. This means if your webhook handler throws an error, you may receive the same event up to 6 times over the next 90 minutes. Your deduplication logic using `nombaEventId` (the `requestId` field in the payload) is therefore critical, not optional.

---

### Correction 8 — Checkout Order Returns `checkoutLink`, Not `checkoutUrl`

**What the documents said:**
The API Contract used `checkoutUrl` as the field name for the redirect URL.

**What Nomba's docs actually say:**
The field returned is `checkoutLink`:

```json
{
  "code": "00",
  "description": "Success",
  "data": {
    "checkoutLink": "https://checkout.nomba.com/pay/78388899***8",
    "orderReference": "90e81e8a-bc14-4ebf-89c0-57**********"
  }
}
```

The `callbackUrl` in the checkout order is where Nomba redirects the customer after payment, with `orderReference` appended as a query param: `https://nombaflow.com/enroll/planId/success?orderReference=90e81e8a...`

---

### Correction 9 — Transfers Have Two Separate Endpoints

**What the documents said:**
Referenced a single "Transfers API" for ajo payouts.

**What Nomba's docs actually say:**
There are two distinct transfer endpoints:

**Bank transfer (external bank accounts):**
```
POST /v2/transfers/bank
Headers: Authorization, accountId, X-Idempotent-key (recommended)
Returns: data.status of SUCCESS, PENDING_BILLING, or REFUND
```

**Wallet transfer (Nomba to Nomba, internal):**
```
POST /v2/transfers/wallet
Near-instant, no sessionId returned
Use requery endpoint for status checks
```

For ajo group payouts to members' bank accounts, use the bank transfer endpoint. Always include `X-Idempotent-key` to prevent duplicate transfers. Always verify account number with bank account lookup before sending.

Transfer limit: 5 bank transfers to the same recipient per minute.

---

## 2. Nomba API Base URL Confirmation

```
Production: https://api.nomba.com/v1
Sandbox: https://api.nomba.com/v1 (same base, sandbox mode controlled by credentials)
```

The `accountId` header is required on every API call. This is the merchant's Nomba account ID, not NombaFlow's internal merchant ID.

---

## 3. Correct Webhook Handler Implementation

This is the complete, correct webhook handler based on the actual Nomba docs:

```typescript
// webhook.controller.ts

@Post('/webhooks/nomba')
async handleNombaWebhook(
  @Headers('nomba-signature') signature: string,
  @Headers('nomba-timestamp') timestamp: string,
  @Body() payload: any,
  @Res() res: Response,
) {
  // Always return 200 immediately to prevent Nomba from retrying
  res.status(200).send();

  // Verify signature
  const isValid = this.webhookService.verifySignature(payload, signature, timestamp);
  if (!isValid) {
    this.logger.warn('Invalid Nomba webhook signature received');
    return;
  }

  // Deduplicate using requestId
  const eventId = payload.requestId;
  const exists = await this.webhookService.isDuplicate(eventId);
  if (exists) {
    this.logger.info(`Duplicate webhook ignored: ${eventId}`);
    return;
  }

  // Queue for async processing (never process synchronously in webhook handler)
  await this.webhookQueue.add('process-nomba-event', {
    eventId,
    eventType: payload.event_type,
    payload,
    receivedAt: new Date().toISOString(),
  });
}
```

**Event type mapping for the queue processor:**

```typescript
switch (event.eventType) {
  case 'payment_success':
    await this.subscriptionService.handlePaymentSuccess(event.payload);
    break;
  case 'payment_failed':
    await this.dunningService.handlePaymentFailed(event.payload);
    break;
  case 'payout_success':
    await this.ajoService.handlePayoutSuccess(event.payload);
    break;
  case 'payout_failed':
    await this.ajoService.handlePayoutFailed(event.payload);
    break;
  default:
    this.logger.info(`Unhandled event type: ${event.eventType}`);
}
```

---

## 4. Correct Checkout Order with Tokenization

This is how to create a checkout order for customer enrollment with card tokenization:

```typescript
// When enrolling a customer
const orderReference = `nf_enroll_${customerId}_${Date.now()}`;

const checkoutOrder = await nombaClient.post('/v1/checkout/order', {
  headers: {
    Authorization: `Bearer ${merchantAccessToken}`,
    accountId: merchantNombaAccountId,
  },
  body: {
    order: {
      orderReference,
      amount: plan.amount,
      currency: 'NGN',
      callbackUrl: `${FRONTEND_URL}/enroll/${planId}/success`,
      customerEmail: customer.email,
      customerId: customer.id,
      allowedPaymentMethods: ['Card'],
    },
    tokenizeCard: true,  // CRITICAL: must be true for recurring billing
  },
});

if (checkoutOrder.code !== '00') {
  throw new Error(`Checkout creation failed: ${checkoutOrder.description}`);
}

// Return to frontend for redirect
return {
  checkoutLink: checkoutOrder.data.checkoutLink,  // Note: checkoutLink not checkoutUrl
  orderReference: checkoutOrder.data.orderReference,
};
```

---

## 5. Correct Recurring Charge Implementation

When the billing scheduler fires for a due subscription:

```typescript
// Charge a tokenized card
const chargeResult = await nombaClient.post('/v1/checkout/tokenized-card-payment', {
  headers: {
    Authorization: `Bearer ${merchantAccessToken}`,
    accountId: merchantNombaAccountId,
    'X-Idempotent-key': chargeAttemptId,  // Prevents duplicate charges
  },
  body: {
    order: {
      orderReference: `nf_charge_${subscriptionId}_${cycleNumber}`,
      customerId: customer.id,
      callbackUrl: `${BACKEND_URL}/webhooks/nomba`,
      customerEmail: customer.email,
      amount: plan.amount,
      currency: 'NGN',
      accountId: merchantNombaAccountId,
    },
    tokenKey: customer.nombaTokenKey,  // Note: tokenKey not tokenId
  },
});

if (chargeResult.code !== '00') {
  // Charge failed synchronously — mark as failed immediately
  await this.chargeService.markFailed(chargeAttemptId, chargeResult.description);
  return;
}

// Charge accepted — wait for payment_success or payment_failed webhook
// Do not give value yet based on this response alone
await this.chargeService.markInitiated(chargeAttemptId);
```

---

## 6. Updated Database Schema Fields for Merchant

Replace the original `Merchant` model's Nomba-related fields with:

```prisma
model Merchant {
  // ... other fields ...
  
  // Nomba OAuth credentials (stored encrypted)
  nombaClientId       String?   @db.Text
  nombaClientSecret   String?   @db.Text  // encrypted
  nombaAccountId      String?   // the accountId header value

  // Current tokens (rotated automatically)
  nombaAccessToken    String?   @db.Text  // encrypted
  nombaRefreshToken   String?   @db.Text  // encrypted
  nombaTokenExpiresAt DateTime?
  nombaConnected      Boolean   @default(false)
  nombaConnectedAt    DateTime?
}
```

Replace `Customer.nombaTokenId` with:

```prisma
model Customer {
  // ... other fields ...
  nombaTokenKey        String?   // the tokenKey from tokenizedCardData
  nombaTokenCardType   String?   // Visa, Mastercard etc
  nombaTokenCardPan    String?   // masked card number for display
}
```

---

## 7. What This Means for the Build

Changes the Backend Developer needs to make on Day 1 before anything else:

1. Update the Prisma schema with the corrected Nomba credential fields and `nombaTokenKey` instead of `nombaTokenId`
2. Write the Nomba client wrapper using OAuth 2.0 flow with token refresh job
3. Build the correct webhook verification function from Section 3 above
4. Update the `POST /merchants/me/nomba-credentials` endpoint to accept `clientId`, `clientSecret`, `accountId`
5. Make sure all webhook event type checks use underscores: `payment_success`, `payment_failed` etc.

Changes the AI Specialist needs to make:
- None. The AI service does not call Nomba directly.

Changes the Full Stack Developer needs to make:
- The onboarding screen collects three fields: Client ID, Client Secret, Account ID — not a single API key
- Use `checkoutLink` from the enrollment response, not `checkoutUrl`

---

## 8. Things the Documents Got Right

For completeness, these sections were already accurate and do not need changes:

- The overall architecture (NestJS + Next.js + FastAPI) is sound
- BullMQ job queue pattern for async webhook processing is correct and necessary
- The idempotency key approach for charges is correct (Nomba supports `X-Idempotent-key`)
- The subscription state machine logic is accurate
- The AI dunning model approach is independent of Nomba's API and works as documented
- The database schema structure (multi-tenant, decimal for money, indexes) is correct
- The overall product concept matches the Subscriptions Engine track requirements

---

*Read this document before touching any Nomba API integration code. When in doubt, check https://developer.nomba.com/llms.txt to find the right documentation page and read it directly.*
