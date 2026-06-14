import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加用户(管理员)' })
  async createUser(@Body() body: any, @CurrentUser('id') operatorId: number) {
    const user = await this.usersService.createUser(body, operatorId);
    return { data: user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '编辑用户(管理员)' })
  async updateUser(@Param('id') id: number, @Body() body: any) {
    const user = await this.usersService.updateUser(id, body);
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
}
