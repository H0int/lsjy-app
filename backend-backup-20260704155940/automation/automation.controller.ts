import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('automation')
@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator')
@ApiBearerAuth()
export class AutomationController {
  constructor(private readonly service: AutomationService) {}

  @Get('rules')
  @ApiOperation({ summary: '规则列表' })
  async findAllRules(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    const data = await this.service.findAllRules(page, pageSize);
    return { data };
  }

  @Get('rules/:id')
  @ApiOperation({ summary: '规则详情' })
  async findOneRule(@Param('id') id: number) {
    const data = await this.service.findOneRule(id);
    return { data };
  }

  @Post('rules')
  @ApiOperation({ summary: '创建规则' })
  async createRule(@Body() body: any) {
    const data = await this.service.createRule(body);
    return { data };
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '编辑规则' })
  async updateRule(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.updateRule(id, body);
    return { data };
  }

  @Put('rules/:id/toggle')
  @ApiOperation({ summary: '启用/禁用规则' })
  async toggleRule(@Param('id') id: number) {
    const data = await this.service.toggleRule(id);
    return { data };
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除规则' })
  async removeRule(@Param('id') id: number) {
    await this.service.removeRule(id);
    return { data: { message: '删除成功' } };
  }

  @Get('rules/:id/logs')
  @ApiOperation({ summary: '规则执行日志' })
  async getRuleLogs(@Param('id') id: number, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    const data = await this.service.getRuleLogs(id, page, pageSize);
    return { data };
  }
}
