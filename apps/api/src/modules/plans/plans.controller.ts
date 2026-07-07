import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MerchantId } from '../auth/decorators/merchant-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { PlansService } from './plans.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@MerchantId() merchantId: string, @Body() body: CreatePlanDto) {
    return this.plansService.create(merchantId, body);
  }

  @Get()
  list(@MerchantId() merchantId: string) {
    return this.plansService.list(merchantId);
  }

  @Get(':id')
  getById(@MerchantId() merchantId: string, @Param('id') planId: string) {
    return this.plansService.getById(merchantId, planId);
  }

  @Patch(':id')
  update(
    @MerchantId() merchantId: string,
    @Param('id') planId: string,
    @Body() body: UpdatePlanDto,
  ) {
    return this.plansService.update(merchantId, planId, body);
  }

  @Delete(':id')
  archive(@MerchantId() merchantId: string, @Param('id') planId: string) {
    return this.plansService.archive(merchantId, planId);
  }
}
