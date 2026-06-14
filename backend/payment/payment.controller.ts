import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RechargeDto } from './dto/recharge.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('coin/balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询圣点余额' })
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
  @ApiOperation({ summary: '查询圣点交易记录' })
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
  @ApiOperation({ summary: '查询我的支付订单' })
  async getOrders(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.paymentService.getPaymentOrders(userId, page, pageSize);
    return { data: result };
  }

  // Admin order management
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get('admin/orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: '订单列表(管理员)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  async adminGetOrders(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    const result = await this.paymentService.getAllOrders(page, pageSize, status);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get('admin/orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '订单详情(管理员)' })
  async adminGetOrder(@Param('id') id: number) {
    const result = await this.paymentService.getOrderDetail(id);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Put('admin/orders/:id/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: '确认订单(管理员)' })
  async adminConfirmOrder(@Param('id') id: number, @CurrentUser('id') operatorId: number) {
    const result = await this.paymentService.confirmOrder(id, operatorId);
    return { data: result };
  }
}
