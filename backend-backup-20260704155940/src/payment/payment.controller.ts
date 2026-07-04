import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { RechargeDto } from "./dto/recharge.dto";

@ApiTags("payment")
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get("coin/balance")
  @ApiBearerAuth()
  @ApiOperation({ summary: "查询圣力余额" })
  async getBalance(@CurrentUser("id") userId: number) {
    const account = await this.paymentService.getBalance(userId);
    return { data: account };
  }

  @Public()
  @Get("coin/packages")
  @ApiOperation({ summary: "获取充值套餐列表" })
  async getPackages() {
    const packages = await this.paymentService.getPackages();
    return { data: packages };
  }

  @UseGuards(JwtAuthGuard)
  @Post("coin/recharge")
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建充值订单" })
  async recharge(@CurrentUser("id") userId: number, @Body() dto: RechargeDto) {
    const result = await this.paymentService.createRecharge(userId, dto.packageId);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get("coin/transactions")
  @ApiBearerAuth()
  @ApiOperation({ summary: "查询圣力交易记录" })
  @ApiQuery({ name: "type", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "pageSize", required: false })
  async getTransactions(
    @CurrentUser("id") userId: number,
    @Query("type") type?: string,
    @Query("page") page = 1,
    @Query("pageSize") pageSize = 20,
  ) {
    const result = await this.paymentService.getTransactions(userId, type, page, pageSize);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get("orders")
  @ApiBearerAuth()
  @ApiOperation({ summary: "查询支付订单" })
  async getOrders(
    @CurrentUser("id") userId: number,
    @Query("page") page = 1,
    @Query("pageSize") pageSize = 20,
  ) {
    const result = await this.paymentService.getPaymentOrders(userId, page, pageSize);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post("coin/submit-screenshot")
  @ApiBearerAuth()
  async submitScreenshot(@CurrentUser("id") userId: number, @Body() body: { orderId: number; screenshotUrl: string }) {
    const result = await this.paymentService.submitScreenshot(userId, body.orderId, body.screenshotUrl);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get("coin/my-orders")
  @ApiBearerAuth()
  async getMyOrders(@CurrentUser("id") userId: number, @Query("page") page = 1, @Query("pageSize") pageSize = 20) {
    const items = await this.paymentService.getUserOrders(userId, page, pageSize);
    return { data: { items } };
  }

  @UseGuards(JwtAuthGuard)
  @Post("admin/coins/adjust")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Boss后台给用户充值圣点" })
  async adminAdjustCoins(
    @CurrentUser() user: any,
    @Body() body: { userId: number; amount: number; remark?: string },
  ) {
    const roles: string[] = user?.roles || [];
    const canAdjust = roles.includes('boss') || roles.includes('founder') || roles.includes('ultimate_admin') || roles.includes('super_admin') || roles.includes('admin') || user?.membershipTier === 'founder';
    if (!canAdjust) {
      throw new ForbiddenException('只有Boss或高级管理员可以手动充值圣点');
    }
    const account = await this.paymentService.adminAdjustCoins(
      Number(user.sub || user.id),
      Number(body.userId),
      Number(body.amount),
      body.remark,
    );
    return { data: { account, message: '充值成功' } };
  }

  @Get("admin/orders")
  @ApiOperation({ summary: "管理员查看所有订单" })
  async getAllOrders(@Query() query: { page?: number; pageSize?: number; status?: string }) {
    const page = parseInt(String(query.page)) || 1;
    const pageSize = parseInt(String(query.pageSize)) || 20;
    return this.paymentService.getAllPaymentOrders(page, pageSize, query.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get("coin/orders")
  @ApiBearerAuth()
  @ApiOperation({ summary: "兼容后台充值管理订单列表" })
  async getCoinOrders(@Query() query: { page?: number; pageSize?: number; status?: string }) {
    const page = parseInt(String(query.page)) || 1;
    const pageSize = parseInt(String(query.pageSize)) || 20;
    const result = await this.paymentService.getAllPaymentOrders(page, pageSize, query.status);
    return { data: { items: result.list || [], total: result.total || 0, page, pageSize } };
  }

  @UseGuards(JwtAuthGuard)
  @Post("coin/approve/:orderId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "兼容后台充值审批" })
  async approveCoinOrder(
    @Param("orderId") orderId: string,
    @Body() body: { action?: 'approve' | 'reject'; remark?: string },
    @CurrentUser("username") username: string,
  ) {
    if (body.action === 'reject') {
      return this.paymentService.rejectOrder(parseInt(orderId), username || 'admin', body.remark);
    }
    return this.paymentService.approveOrder(parseInt(orderId), username || 'admin');
  }

  @Put("admin/orders/:id/approve")
  @ApiOperation({ summary: "管理员通过订单" })
  async approveOrder(@Param() params: { id: string }, @CurrentUser("username") username: string) {
    return this.paymentService.approveOrder(parseInt(params.id), username);
  }

  @Put("admin/orders/:id/reject")
  @ApiOperation({ summary: "管理员拒绝订单" })
  async rejectOrder(@Param() params: { id: string }, @Body() body: { reason?: string }, @CurrentUser("username") username: string) {
    return this.paymentService.rejectOrder(parseInt(params.id), username, body.reason);
  }
}
