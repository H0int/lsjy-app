import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Roles('super_admin', 'operator', 'support')
  @Get()
  @ApiOperation({ summary: '工单列表(管理员)' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    const data = await this.service.findAll(page, pageSize, status);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: '工单详情' })
  async findOne(@Param('id') id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: '创建工单' })
  async create(@CurrentUser('id') userId: number, @Body() body: any) {
    const data = await this.service.create(userId, body);
    return { data };
  }

  @Roles('super_admin', 'operator', 'support')
  @Post(':id/assign')
  @ApiOperation({ summary: '分配客服' })
  async assign(@Param('id') id: number, @Body('assignedTo') assignedTo: number) {
    const data = await this.service.assign(id, assignedTo);
    return { data };
  }

  @Post(':id/reply')
  @ApiOperation({ summary: '回复工单' })
  async reply(
    @Param('id') id: number,
    @CurrentUser() user: any,
    @Body('content') content: string,
  ) {
    const isAdmin = user.roles?.some((r: string) => ['super_admin', 'operator', 'support'].includes(r));
    const data = await this.service.reply(id, user.id, content, isAdmin);
    return { data };
  }

  @Roles('super_admin', 'operator', 'support')
  @Post(':id/resolve')
  @ApiOperation({ summary: '解决工单' })
  async resolve(@Param('id') id: number, @CurrentUser('id') userId: number) {
    const data = await this.service.resolve(id, userId);
    return { data };
  }
}
