import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: '获取已发布公告' })
  async getActive() {
    const data = await this.service.findActive();
    return { data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取公告详情' })
  async findOne(@Param('id') id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '公告列表(管理员)' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    const data = await this.service.findAll(page, pageSize, status);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建公告' })
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '编辑公告' })
  async update(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.update(id, body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除公告' })
  async remove(@Param('id') id: number) {
    await this.service.remove(id);
    return { data: { message: '删除成功' } };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布公告' })
  async publish(@Param('id') id: number, @CurrentUser('id') userId: number) {
    const data = await this.service.publish(id, userId);
    return { data };
  }
}
