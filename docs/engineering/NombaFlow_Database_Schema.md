# NombaFlow — Database Schema Reference

**Purpose:** The Backend Developer keeps this file open while writing migrations and queries.

**Database:** PostgreSQL 17 via Neon
**ORM:** Prisma 7
**File location in repo:** `packages/database/prisma/schema.prisma`

---

## 1. Prisma Configuration Block

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 2. Enums

```prisma
enum MerchantStatus {
  ACTIVE
  SUSPENDED
}

enum PlanStatus {
  ACTIVE
  ARCHIVED
}

enum PlanType {
  STANDARD
  AJO
}

enum BillingInterval {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}

enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAST_DUE
  DUNNING
  SUSPENDED
  CANCELLED
  PAUSED
}

enum ChargeStatus {
  INITIATED
  SUCCESS
  FAILED
  REVERSED
  REFUNDED
}

enum DunningOutcome {
  SUCCESS
  FAILED
  CANCELLED
}

enum AjoStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum AjoMemberStatus {
  PENDING_ENROLLMENT
  ACTIVE
  DEFAULTED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETE
  FAILED
}

enum NotificationStatus {
  QUEUED
  SENT
  FAILED
}
```

---

## 3. Core Tables

### Merchant

```prisma
model Merchant {
  id                  String         @id @default(cuid())
  businessName        String
  email               String         @unique
  passwordHash        String
  // Nomba OAuth credentials (encrypted at application layer)
  nombaClientId       String?        @db.Text
  nombaClientSecret   String?        @db.Text
  nombaAccountId      String?
  nombaAccessToken    String?        @db.Text
  nombaRefreshToken   String?        @db.Text
  nombaTokenExpiresAt DateTime?
  status              MerchantStatus @default(ACTIVE)
  nombaConnected      Boolean        @default(false)
  nombaConnectedAt    DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  plans           Plan[]
  customers       Customer[]
  ajoGroups       AjoGroup[]
  webhookEvents   WebhookEvent[]
  notifications   Notification[]

  @@index([email])
}
```

**Notes:**
- `nombaClientSecret`, `nombaAccessToken`, and `nombaRefreshToken` are encrypted with `ENCRYPTION_KEY` (AES-256-GCM) before storage
- `nombaAccountId` is the value sent in the `accountId` header on every Nomba API call
- Webhook signature verification uses `NOMBA_WEBHOOK_SECRET` from environment (configured in Nomba dashboard), not a per-merchant DB field

---

### Plan

```prisma
model Plan {
  id              String          @id @default(cuid())
  merchantId      String
  name            String
  description     String?
  amount          Decimal         @db.Decimal(12, 2)
  currency        String          @default("NGN")
  interval        BillingInterval
  intervalCount   Int             @default(1)
  trialDays       Int             @default(0)
  maxCycles       Int?
  planType        PlanType        @default(STANDARD)
  status          PlanStatus      @default(ACTIVE)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  merchant        Merchant        @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  subscriptions   Subscription[]

  @@index([merchantId, status])
}
```

**Notes:**
- `maxCycles` is `null` for unlimited billing (e.g. open-ended SaaS subscriptions)
- `intervalCount` allows custom intervals: `intervalCount: 2` with `interval: WEEKLY` means "every 2 weeks"

---

### Customer

```prisma
model Customer {
  id                   String    @id @default(cuid())
  merchantId           String
  name                 String
  email                String
  phone                String?
  nombaTokenKey        String?   @db.Text
  nombaTokenCardType   String?
  nombaTokenCardPan    String?
  nombaVirtualAccountId String?
  virtualAccountNumber String?
  orderReference       String?   @unique
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  merchant             Merchant  @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  subscriptions        Subscription[]
  ajoMemberships       AjoMember[]
  notifications        Notification[]

  @@unique([merchantId, email])
  @@index([merchantId])
}
```

**Notes:**
- `nombaTokenKey` is the `tokenKey` from `tokenizedCardData` in the `payment_success` webhook ([Nomba recurring payments docs](https://developer.nomba.com/docs/products/accept-payment/recurring-payments))
- `orderReference` links enrollment checkout orders to webhook events for subscription creation
- `virtualAccountNumber` is the NUBAN assigned by Nomba Virtual Account API (`POST /v1/accounts/virtual`)
- A customer is scoped to a merchant. The same person using two different merchants' NombaFlow products has two separate Customer records

---

### Subscription

```prisma
model Subscription {
  id                 String             @id @default(cuid())
  merchantId         String
  customerId         String
  planId             String
  status             SubscriptionStatus @default(PENDING)
  currentCycleStart  DateTime?
  nextBillingDate    DateTime?
  cyclesCompleted    Int                @default(0)
  totalPaid          Decimal            @default(0) @db.Decimal(12, 2)
  cancelledAt        DateTime?
  pausedAt           DateTime?
  metadata           Json?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  customer           Customer           @relation(fields: [customerId], references: [id])
  plan               Plan               @relation(fields: [planId], references: [id])
  charges            Charge[]
  dunningAttempts    DunningAttempt[]

  @@index([merchantId, status])
  @@index([nextBillingDate, status])
  @@index([customerId])
}
```

**Critical index:** `@@index([nextBillingDate, status])` — this is what the billing scheduler uses to find every due subscription efficiently. Do not remove it.

---

### Charge

```prisma
model Charge {
  id              String       @id @default(cuid())
  subscriptionId  String
  merchantId      String
  nombaReference  String       @unique
  amount          Decimal      @db.Decimal(12, 2)
  currency        String       @default("NGN")
  status          ChargeStatus @default(INITIATED)
  failureCode     String?
  failureMessage  String?
  nombaResponse   Json?
  attemptNumber   Int          @default(1)
  chargedAt       DateTime     @default(now())
  settledAt       DateTime?
  createdAt       DateTime     @default(now())

  subscription    Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([subscriptionId])
  @@index([merchantId, status])
  @@index([nombaReference])
}
```

**Notes:**
- `nombaReference` is unique and generated by our system before calling Nomba. Format: `nf_ref_{customerId}_{timestamp}`
- `nombaResponse` stores the raw Nomba API response for debugging

---

### DunningAttempt

```prisma
model DunningAttempt {
  id              String          @id @default(cuid())
  subscriptionId  String
  chargeId        String?
  attemptNumber   Int
  scheduledAt     DateTime
  executedAt      DateTime?
  aiScore         Float?
  aiFeatures      Json?
  aiReasoning     String?         @db.Text
  outcome         DunningOutcome?
  createdAt       DateTime        @default(now())

  subscription    Subscription    @relation(fields: [subscriptionId], references: [id])

  @@index([subscriptionId])
  @@index([scheduledAt])
}
```

**Notes:**
- `aiScore` is the confidence score (0.0 to 1.0) from the dunning model
- `aiFeatures` stores the feature vector used to make the prediction, useful for model improvement later
- `scheduledAt` is indexed because the retry job queue reads this to find overdue scheduled retries

---

## 4. Ajo Group Tables

### AjoGroup

```prisma
model AjoGroup {
  id                 String     @id @default(cuid())
  merchantId         String
  name               String
  contributionAmount Decimal    @db.Decimal(12, 2)
  currency           String     @default("NGN")
  frequency          BillingInterval
  currentRound       Int        @default(0)
  totalRounds        Int
  status             AjoStatus  @default(ACTIVE)
  nextContributionDate DateTime?
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  merchant           Merchant   @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  members            AjoMember[]
  payouts            AjoPayout[]

  @@index([merchantId, status])
}
```

### AjoMember

```prisma
model AjoMember {
  id           String          @id @default(cuid())
  ajoGroupId   String
  customerId   String?
  name         String
  email        String
  phone        String?
  position     Int
  status       AjoMemberStatus @default(PENDING_ENROLLMENT)
  enrolledAt   DateTime?
  createdAt    DateTime        @default(now())

  ajoGroup     AjoGroup        @relation(fields: [ajoGroupId], references: [id], onDelete: Cascade)
  customer     Customer?       @relation(fields: [customerId], references: [id])

  @@unique([ajoGroupId, position])
  @@unique([ajoGroupId, email])
  @@index([ajoGroupId])
}
```

### AjoPayout

```prisma
model AjoPayout {
  id              String        @id @default(cuid())
  ajoGroupId      String
  roundNumber     Int
  beneficiaryId   String
  amount          Decimal       @db.Decimal(12, 2)
  nombaReference  String?       @unique
  status          PayoutStatus  @default(PENDING)
  scheduledAt     DateTime
  executedAt      DateTime?
  nombaResponse   Json?
  createdAt       DateTime      @default(now())

  ajoGroup        AjoGroup      @relation(fields: [ajoGroupId], references: [id])

  @@unique([ajoGroupId, roundNumber])
  @@index([ajoGroupId])
}
```

---

## 5. Supporting Tables

### WebhookEvent

```prisma
model WebhookEvent {
  id              String    @id @default(cuid())
  merchantId      String?
  nombaEventId    String    @unique
  eventType       String
  payload         Json
  processed       Boolean   @default(false)
  processingError String?   @db.Text
  receivedAt      DateTime  @default(now())
  processedAt     DateTime?

  @@index([processed, receivedAt])
  @@index([nombaEventId])
}
```

**Notes:**
- `nombaEventId` is unique to prevent duplicate processing if Nomba retries a webhook
- The `@@index([processed, receivedAt])` index powers the dead letter queue query

### Notification

```prisma
model Notification {
  id          String             @id @default(cuid())
  merchantId  String
  customerId  String?
  type        String
  subject     String
  body        String             @db.Text
  status      NotificationStatus @default(QUEUED)
  sentAt      DateTime?
  error       String?
  createdAt   DateTime           @default(now())

  merchant    Merchant           @relation(fields: [merchantId], references: [id])
  customer    Customer?          @relation(fields: [customerId], references: [id])

  @@index([merchantId, status])
  @@index([customerId])
}
```

---

## 6. Key Design Rules

**Multi-tenancy:** every table that contains merchant data has a `merchantId` field. Every query in the application must scope by `merchantId` first. Failing to do this exposes one merchant's data to another.

**Money fields:** all money amounts use `Decimal @db.Decimal(12, 2)` in Prisma and are transported as strings between services. Never use `Float` for money.

**Soft deletes:** we do not hard delete records during the hackathon. Plans get `status: ARCHIVED`. Subscriptions get `status: CANCELLED`. This keeps charge history intact.

**Indexes:** the three most critical indexes for performance are:
- `Subscription: @@index([nextBillingDate, status])` — billing scheduler
- `Charge: @@index([nombaReference])` — webhook lookup
- `WebhookEvent: @@index([nombaEventId])` — deduplication

---

## 7. Migration Commands

```bash
# Run from packages/database/ (or: pnpm --filter @nombaflow/database exec prisma ...)

# Create and apply a new migration
pnpm exec prisma migrate dev --name describe_what_changed

# Apply pending migrations in production
pnpm exec prisma migrate deploy

# Regenerate Prisma client after schema changes
pnpm exec prisma generate

# Open Prisma Studio to browse data during development
pnpm exec prisma studio

# Seed the database with demo data
pnpm exec prisma db seed
```

---

## 8. Seed File Location

`packages/database/prisma/seed.ts`

The seed file creates the demo merchant account and all demo data matching the spec in PRD Section 9. Run it before every demo rehearsal to reset the demo account to a clean state.
