import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@nombaflow/database';
import { PrismaService } from '../../database/prisma.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ApiException } from '../../common/errors/api.exception';
import type { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import {
  toPlanDetailResponse,
  toPlanDetailWithSubscribers,
  toPlanListItem,
} from './plans.mapper';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, body: CreatePlanDto) {
    const plan = await this.prisma.plan.create({
      data: {
        merchantId,
        name: body.name,
        description: body.description,
        amount: new Prisma.Decimal(body.amount),
        currency: body.currency,
        interval: body.interval,
        intervalCount: body.intervalCount,
        maxCycles: body.maxCycles ?? null,
        planType: body.planType,
        trialDays: body.trialDays,
      },
    });

    return toPlanDetailResponse(plan);
  }

  async list(merchantId: string) {
    const plans = await this.prisma.plan.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        amount: true,
        interval: true,
        status: true,
      },
    });

    const activeCounts = await this.prisma.subscription.groupBy({
      by: ['planId'],
      where: {
        merchantId,
        status: 'ACTIVE',
      },
      _count: { _all: true },
    });

    const countByPlanId = new Map(
      activeCounts.map((entry) => [entry.planId, entry._count._all]),
    );

    return {
      plans: plans.map((plan) =>
        toPlanListItem(plan, countByPlanId.get(plan.id) ?? 0),
      ),
    };
  }

  async getById(merchantId: string, planId: string) {
    const plan = await this.getOwnedPlan(planId, merchantId);
    const subscribers = await this.getSubscriberSummary(planId, merchantId);

    return toPlanDetailWithSubscribers(plan, subscribers);
  }

  async update(merchantId: string, planId: string, body: UpdatePlanDto) {
    const plan = await this.getOwnedPlan(planId, merchantId);

    if (plan.status === 'ARCHIVED') {
      throw new ApiException(
        ApiErrorCode.VALIDATION_ERROR,
        'Archived plans cannot be updated.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updated = await this.prisma.plan.update({
      where: { id: plan.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
      },
    });

    return toPlanDetailResponse(updated);
  }

  async archive(merchantId: string, planId: string) {
    const plan = await this.getOwnedPlan(planId, merchantId);

    if (plan.status === 'ARCHIVED') {
      return toPlanDetailResponse(plan);
    }

    const activeSubscriberCount = await this.prisma.subscription.count({
      where: {
        planId: plan.id,
        merchantId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriberCount > 0) {
      throw new ApiException(
        ApiErrorCode.VALIDATION_ERROR,
        'Cannot archive a plan with active subscribers.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const archived = await this.prisma.plan.update({
      where: { id: plan.id },
      data: { status: 'ARCHIVED' },
    });

    return toPlanDetailResponse(archived);
  }

  private async getOwnedPlan(planId: string, merchantId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, merchantId },
    });

    if (plan) {
      return plan;
    }

    const exists = await this.prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true },
    });

    if (exists) {
      throw new ApiException(
        ApiErrorCode.FORBIDDEN,
        'You do not have access to this plan.',
        HttpStatus.FORBIDDEN,
      );
    }

    throw new ApiException(
      ApiErrorCode.NOT_FOUND,
      'Plan not found.',
      HttpStatus.NOT_FOUND,
    );
  }

  private async getSubscriberSummary(planId: string, merchantId: string) {
    const [active, pastDue, cancelled] = await Promise.all([
      this.prisma.subscription.count({
        where: { planId, merchantId, status: 'ACTIVE' },
      }),
      this.prisma.subscription.count({
        where: {
          planId,
          merchantId,
          status: { in: ['PAST_DUE', 'DUNNING'] },
        },
      }),
      this.prisma.subscription.count({
        where: { planId, merchantId, status: 'CANCELLED' },
      }),
    ]);

    return { active, pastDue, cancelled };
  }
}
