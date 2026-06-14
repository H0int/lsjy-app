import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator')
@ApiBearerAuth()
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get()
  @ApiOperation({ summary: '优惠券列表' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    const data = await this.service.findAll(page, pageSize, status);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: '优惠券详情' })
  async findOne(@Param('id') id: number) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: '创建优惠券' })
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑优惠券' })
  async update(@Param('id') id: number, @Body() body: any) {
    const data = await this.service.update(id, body);
    return { data };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除优惠券' })
  async remove(@Param('id') id: number) {
    await this.service.remove(id);
    return { data: { message: '删除成功' } };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '启用/暂停优惠券' })
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    const data = await this.service.updateStatus(id, status);
    return { data };
  }
}
