import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RechargeDto } from './dto/recharge.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('coin/balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询圣力余额' })
  async getBalance(@CurrentUser('id') userId: number) {
    const account = await this.paymentService.getBalance(userId);
    return { data: account };
  }

  @Public()
  @Get('coin/packages')
  @ApiOperation({ summary: '获取充值套餐列表' })
  async getPackages() {
    const packages = await this.paymentService.getPackages();
    return { data: packages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('coin/recharge')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建充值订单' })
  async recharge(
    @CurrentUser('id') userId: number,
    @Body() dto: RechargeDto,
  ) {
    const result = await this.paymentService.createRecharge(userId, dto.packageId);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('coin/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询圣力交易记录' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getTransactions(
    @CurrentUser('id') userId: number,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.paymentService.getTransactions(userId, type, page, pageSize);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询支付订单' })
  async getOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.paymentService.getPaymentOrders(userId, page, pageSize);
    return { data: result };
  }
}
