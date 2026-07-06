import type { Plan } from '@nombaflow/database';
import { loadEnv } from '../../config/env';

type PlanRecord = Pick<
  Plan,
  | 'id'
  | 'merchantId'
  | 'name'
  | 'description'
  | 'amount'
  | 'currency'
  | 'interval'
  | 'intervalCount'
  | 'maxCycles'
  | 'planType'
  | 'status'
  | 'trialDays'
  | 'createdAt'
>;

function formatAmount(amount: Plan['amount']): string {
  return amount.toFixed(2);
}

function buildEnrollmentLink(planId: string): string {
  const base = loadEnv().FRONTEND_URL.replace(/\/$/, '');
  return `${base}/enroll/${planId}`;
}

export function toPlanDetailResponse(plan: PlanRecord) {
  return {
    id: plan.id,
    merchantId: plan.merchantId,
    name: plan.name,
    description: plan.description,
    amount: formatAmount(plan.amount),
    currency: plan.currency,
    interval: plan.interval,
    intervalCount: plan.intervalCount,
    maxCycles: plan.maxCycles,
    planType: plan.planType,
    status: plan.status,
    trialDays: plan.trialDays,
    enrollmentLink: buildEnrollmentLink(plan.id),
    createdAt: plan.createdAt.toISOString(),
  };
}

export function toPlanListItem(
  plan: Pick<Plan, 'id' | 'name' | 'amount' | 'interval' | 'status'>,
  activeSubscriberCount: number,
) {
  return {
    id: plan.id,
    name: plan.name,
    amount: formatAmount(plan.amount),
    interval: plan.interval,
    status: plan.status,
    activeSubscriberCount,
  };
}

export function toPlanDetailWithSubscribers(
  plan: PlanRecord,
  subscribers: { active: number; pastDue: number; cancelled: number },
) {
  return {
    id: plan.id,
    merchantId: plan.merchantId,
    name: plan.name,
    description: plan.description,
    amount: formatAmount(plan.amount),
    currency: plan.currency,
    interval: plan.interval,
    intervalCount: plan.intervalCount,
    maxCycles: plan.maxCycles,
    planType: plan.planType,
    status: plan.status,
    trialDays: plan.trialDays,
    enrollmentLink: buildEnrollmentLink(plan.id),
    createdAt: plan.createdAt.toISOString(),
    subscribers,
  };
}
