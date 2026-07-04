import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有角色' })
  async findAll() {
    const roles = await this.rolesService.findAll();
    return { data: roles };
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取所有权限' })
  async getPermissions() {
    const permissions = await this.rolesService.getAllPermissions();
    return { data: permissions };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  async findOne(@Param('id') id: number) {
    const role = await this.rolesService.findOne(id);
    return { data: role };
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  async create(@Body() data: Partial<any>) {
    const role = await this.rolesService.createRole(data);
    return { data: role };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  async update(@Param('id') id: number, @Body() data: Partial<any>) {
    const role = await this.rolesService.updateRole(id, data);
    return { data: role };
  }

  @Post('assign')
  @ApiOperation({ summary: '分配角色给用户' })
  async assignRole(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
    @Body('scopeType') scopeType?: string,
    @Body('scopeId') scopeId?: number,
  ) {
    const userRole = await this.rolesService.assignRole(userId, roleId, scopeType, scopeId);
    return { data: userRole };
  }

  @Delete('user/:userId/role/:roleId')
  @ApiOperation({ summary: '移除用户角色' })
  async removeRole(@Param('userId') userId: number, @Param('roleId') roleId: number) {
    await this.rolesService.removeUserRole(userId, roleId);
    return { data: { message: '角色已移除' } };
  }
}
