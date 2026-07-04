import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: '获取进行中的活动' })
  async getActive() {
    const data = await this.service.findActive();
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '活动列表' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    const data = await this.service.findAll(page, pageSize, status);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建活动' })
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '编辑活动' })
  async update(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.update(id, body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除活动' })
  async remove(@Param('id') id: number) {
    await this.service.remove(id);
    return { data: { message: '删除成功' } };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上线/暂停活动' })
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    const data = await this.service.updateStatus(id, status);
    return { data };
  }
}
