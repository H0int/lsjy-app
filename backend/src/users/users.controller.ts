import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户统计数据' })
  async getUserDashboard(@CurrentUser('id') userId: number) {
    const data = await this.usersService.getUserDashboard(userId);
    return { code: 0, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getMe(@CurrentUser('id') userId: number) {
    const user = await this.usersService.findById(userId);
    const roles = await this.usersService.getUserRoles(userId);
    return { data: { ...user, roles } };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人信息' })
  async updateProfile(@CurrentUser('id') userId: number, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return { data: user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户角色' })
  async getMyRoles(@CurrentUser('id') userId: number) {
    const roles = await this.usersService.getUserRoles(userId);
    return { data: roles };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户列表(管理员)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    const result = await this.usersService.findAll(page, pageSize, status);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'operator')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取指定用户信息(管理员)' })
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户状态(超级管理员)' })
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    await this.usersService.updateUserStatus(id, status);
    return { data: { message: '状态更新成功' } };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'boss')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户(超级管理员/罗总)' })
  async deleteUser(@Param('id') id: number) {
    await this.usersService.deleteUser(id);
    return { data: { message: '用户已删除' } };
  }
}
