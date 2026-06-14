import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('overview')
  @ApiOperation({ summary: '概览数据' })
  async getOverview() {
    const data = await this.service.getOverview();
    return { data };
  }

  @Get('trend')
  @ApiOperation({ summary: '趋势数据' })
  @ApiQuery({ name: 'days', required: false })
  async getTrend(@Query('days') days = 7) {
    const data = await this.service.getTrend(days);
    return { data };
  }

  @Get('revenue')
  @ApiOperation({ summary: '收入报表' })
  @ApiQuery({ name: 'days', required: false })
  async getRevenue(@Query('days') days = 30) {
    const data = await this.service.getRevenue(days);
    return { data };
  }
}
