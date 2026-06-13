import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('configs/public')
  @ApiOperation({ summary: '获取公开配置' })
  async getPublicConfigs() {
    const configs = await this.systemService.getPublicConfigs();
    return { data: configs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('configs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有配置(管理员)' })
  async getAllConfigs() {
    const configs = await this.systemService.getAllConfigs();
    return { data: configs };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put('configs/:key')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新配置(超级管理员)' })
  async updateConfig(
    @Param('key') key: string,
    @Body('value') value: string,
    @CurrentUser('id') userId: number,
  ) {
    const config = await this.systemService.updateConfig(key, value, userId);
    return { data: config };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get('logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取操作日志(管理员)' })
  @ApiQuery({ name: 'module', required: false })
  async getLogs(
    @Query('module') module?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.systemService.getLogs(page, pageSize, module);
    return { data: result };
  }
}

// Separate controller for notifications
@ApiTags('system')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly systemService: SystemService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取通知列表' })
  async getNotifications(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.systemService.getUserNotifications(userId, page, pageSize);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取未读通知数' })
  async getUnreadCount(@CurrentUser('id') userId: number) {
    const count = await this.systemService.getUnreadCount(userId);
    return { data: { count } };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记通知已读' })
  async markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id') id: number,
  ) {
    await this.systemService.markAsRead(userId, id);
    return { data: { message: '已标记为已读' } };
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: '全部标记已读' })
  async markAllAsRead(@CurrentUser('id') userId: number) {
    await this.systemService.markAllAsRead(userId);
    return { data: { message: '全部标记已读' } };
  }
}
