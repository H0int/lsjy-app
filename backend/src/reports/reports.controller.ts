import { Controller, Get, Query, UseGuards, Param, Put, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('reports/overview')
  @ApiOperation({ summary: '概览数据' })
  @Roles('super_admin', 'operator')
  async getOverview() {
    const data = await this.service.getOverview();
    return { data };
  }

  @Get('reports/trend')
  @ApiOperation({ summary: '趋势数据' })
  @ApiQuery({ name: 'days', required: false })
  @Roles('super_admin', 'operator')
  async getTrend(@Query('days') days = 7) {
    const data = await this.service.getTrend(days);
    return { data };
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: '收入报表' })
  @ApiQuery({ name: 'days', required: false })
  @Roles('super_admin', 'operator')
  async getRevenue(@Query('days') days = 30) {
    const data = await this.service.getRevenue(days);
    return { data };
  }

  @Get('admin/dashboard')
  @ApiOperation({ summary: '管理后台Dashboard总数据' })
  @Roles('super_admin', 'operator', 'admin')
  async getAdminDashboard() {
    const data = await this.service.getAdminDashboard();
    return { code: 0, data };
  }

  @Get('admin/api-errors')
  @ApiOperation({ summary: 'API错误列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @Roles('super_admin', 'operator')
  async getApiErrors(@Query('status') status?: string, @Query('pageSize') pageSize = 20) {
    const data = await this.service.getApiErrors(status, Number(pageSize));
    return { code: 0, data };
  }

  @Put('admin/api-errors/:id')
  @ApiOperation({ summary: '更新API错误状态' })
  @Roles('super_admin', 'operator')
  async updateApiError(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.updateApiError(id, body);
    return { code: 0, data };
  }

  @Post('admin/api-errors/:id/retry')
  @ApiOperation({ summary: '重试API错误' })
  @Roles('super_admin', 'operator')
  async retryApiError(@Param('id') id: number) {
    const data = await this.service.retryApiError(id);
    return { code: 0, data };
  }

  @Get('admin/payment-failures')
  @ApiOperation({ summary: '支付失败列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @Roles('super_admin', 'operator')
  async getPaymentFailures(@Query('status') status?: string, @Query('pageSize') pageSize = 20) {
    const data = await this.service.getPaymentFailures(status, Number(pageSize));
    return { code: 0, data };
  }

  @Put('admin/payment-failures/:id')
  @ApiOperation({ summary: '更新支付失败状态' })
  @Roles('super_admin', 'operator')
  async updatePaymentFailure(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.updatePaymentFailure(id, body);
    return { code: 0, data };
  }

  @Post('admin/payment-failures/:id/retry')
  @ApiOperation({ summary: '重试支付失败' })
  @Roles('super_admin', 'operator')
  async retryPaymentFailure(@Param('id') id: number) {
    const data = await this.service.retryPaymentFailure(id);
    return { code: 0, data };
  }
}
