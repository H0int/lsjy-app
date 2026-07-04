import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly service: FaqsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'FAQ列表(公开)' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('category') category?: string) {
    const data = await this.service.findAll(page, pageSize, category);
    return { data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'FAQ详情' })
  async findOne(@Param('id') id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get('admin/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'FAQ列表(管理员)' })
  async findAllAdmin(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    const data = await this.service.findAllAdmin(page, pageSize, status);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建FAQ' })
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '编辑FAQ' })
  async update(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.update(id, body);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除FAQ' })
  async remove(@Param('id') id: number) {
    await this.service.remove(id);
    return { data: { message: '删除成功' } };
  }
}
