import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('moderation')
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator', 'content_reviewer')
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  @Get('list')
  @ApiOperation({ summary: '待审核内容列表' })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
    @Query('contentType') contentType?: string,
  ) {
    const data = await this.service.findAll(page, pageSize, status, contentType);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: '内容详情' })
  async findOne(@Param('id') id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '通过审核' })
  async approve(@Param('id') id: number, @CurrentUser('id') userId: number) {
    const data = await this.service.approve(id, userId);
    return { data };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '拒绝审核' })
  async reject(@Param('id') id: number, @CurrentUser('id') userId: number, @Body('reason') reason: string) {
    const data = await this.service.reject(id, userId, reason);
    return { data };
  }

  @Post(':id/flag')
  @ApiOperation({ summary: '标记内容' })
  async flag(@Param('id') id: number, @Body('reason') reason: string) {
    const data = await this.service.flag(id, reason);
    return { data };
  }
}
