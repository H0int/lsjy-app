import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { Request } from 'express';

@ApiTags('visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Public()
  @Post('checkin')
  @ApiOperation({ summary: '访客签到' })
  async checkin(@Body() body: { page?: string; referer?: string }, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    await this.visitorsService.checkin(ip, body.page || '/', body.referer || '', userAgent);
    return { data: { message: '签到成功' } };
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: '获取访客统计' })
  async getStats() {
    const stats = await this.visitorsService.getStats();
    return { data: stats };
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取访客列表(管理)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getList(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.visitorsService.getList(page, pageSize);
    return { data: result };
  }
}
