-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('STANDARD', 'AJO');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'DUNNING', 'SUSPENDED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'REVERSED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DunningOutcome" AS ENUM ('SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AjoStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AjoMemberStatus" AS ENUM ('PENDING_ENROLLMENT', 'ACTIVE', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombaClientId" TEXT,
    "nombaClientSecret" TEXT,
    "nombaAccountId" TEXT,
    "nombaAccessToken" TEXT,
    "nombaRefreshToken" TEXT,
    "nombaTokenExpiresAt" TIMESTAMP(3),
    "status" "MerchantStatus" NOT NULL DEFAULT 'ACTIVE',
    "nombaConnected" BOOLEAN NOT NULL DEFAULT false,
    "nombaConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "interval" "BillingInterval" NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "maxCycles" INTEGER,
    "planType" "PlanType" NOT NULL DEFAULT 'STANDARD',
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "nombaTokenKey" TEXT,
    "nombaTokenCardType" TEXT,
    "nombaTokenCardPan" TEXT,
    "nombaVirtualAccountId" TEXT,
    "virtualAccountNumber" TEXT,
    "orderReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "currentCycleStart" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "cyclesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cancelledAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "nombaReference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "ChargeStatus" NOT NULL DEFAULT 'INITIATED',
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "nombaResponse" JSONB,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "chargedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DunningAttempt" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "chargeId" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "aiScore" DOUBLE PRECISION,
    "aiFeatures" JSONB,
    "aiReasoning" TEXT,
    "outcome" "DunningOutcome",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DunningAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjoGroup" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contributionAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "frequency" "BillingInterval" NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "totalRounds" INTEGER NOT NULL,
    "status" "AjoStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextContributionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AjoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjoMember" (
    "id" TEXT NOT NULL,
    "ajoGroupId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" INTEGER NOT NULL,
    "status" "AjoMemberStatus" NOT NULL DEFAULT 'PENDING_ENROLLMENT',
    "enrolledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AjoMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjoPayout" (
    "id" TEXT NOT NULL,
    "ajoGroupId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "nombaReference" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "nombaResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AjoPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "nombaEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE INDEX "Merchant_email_idx" ON "Merchant"("email");

-- CreateIndex
CREATE INDEX "Plan_merchantId_status_idx" ON "Plan"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_orderReference_key" ON "Customer"("orderReference");

-- CreateIndex
CREATE INDEX "Customer_merchantId_idx" ON "Customer"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_merchantId_email_key" ON "Customer"("merchantId", "email");

-- CreateIndex
CREATE INDEX "Subscription_merchantId_status_idx" ON "Subscription"("merchantId", "status");

-- CreateIndex
CREATE INDEX "Subscription_nextBillingDate_status_idx" ON "Subscription"("nextBillingDate", "status");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_nombaReference_key" ON "Charge"("nombaReference");

-- CreateIndex
CREATE INDEX "Charge_subscriptionId_idx" ON "Charge"("subscriptionId");

-- CreateIndex
CREATE INDEX "Charge_merchantId_status_idx" ON "Charge"("merchantId", "status");

-- CreateIndex
CREATE INDEX "Charge_nombaReference_idx" ON "Charge"("nombaReference");

-- CreateIndex
CREATE INDEX "DunningAttempt_subscriptionId_idx" ON "DunningAttempt"("subscriptionId");

-- CreateIndex
CREATE INDEX "DunningAttempt_scheduledAt_idx" ON "DunningAttempt"("scheduledAt");

-- CreateIndex
CREATE INDEX "AjoGroup_merchantId_status_idx" ON "AjoGroup"("merchantId", "status");

-- CreateIndex
CREATE INDEX "AjoMember_ajoGroupId_idx" ON "AjoMember"("ajoGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "AjoMember_ajoGroupId_position_key" ON "AjoMember"("ajoGroupId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AjoMember_ajoGroupId_email_key" ON "AjoMember"("ajoGroupId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "AjoPayout_nombaReference_key" ON "AjoPayout"("nombaReference");

-- CreateIndex
CREATE INDEX "AjoPayout_ajoGroupId_idx" ON "AjoPayout"("ajoGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "AjoPayout_ajoGroupId_roundNumber_key" ON "AjoPayout"("ajoGroupId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_nombaEventId_key" ON "WebhookEvent"("nombaEventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_processed_receivedAt_idx" ON "WebhookEvent"("processed", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_nombaEventId_idx" ON "WebhookEvent"("nombaEventId");

-- CreateIndex
CREATE INDEX "Notification_merchantId_status_idx" ON "Notification"("merchantId", "status");

-- CreateIndex
CREATE INDEX "Notification_customerId_idx" ON "Notification"("customerId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DunningAttempt" ADD CONSTRAINT "DunningAttempt_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoGroup" ADD CONSTRAINT "AjoGroup_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoMember" ADD CONSTRAINT "AjoMember_ajoGroupId_fkey" FOREIGN KEY ("ajoGroupId") REFERENCES "AjoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoMember" ADD CONSTRAINT "AjoMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjoPayout" ADD CONSTRAINT "AjoPayout_ajoGroupId_fkey" FOREIGN KEY ("ajoGroupId") REFERENCES "AjoGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
