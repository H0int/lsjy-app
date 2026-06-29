import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin - 管理API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== AI智能体管理 ====================
  @Get('agents')
  @ApiOperation({ summary: '获取AI智能体列表' })
  async getAgents(@Query() query: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    keyword?: string;
  }) {
    const result = await this.adminService.getAgents(query);
    return { code: 0, data: result };
  }

  @Post('agents')
  @ApiOperation({ summary: '创建AI智能体' })
  async createAgent(@Body() body: {
    name: string;
    description?: string;
    type: string;
    config?: Record<string, any>;
    status?: string;
  }) {
    const result = await this.adminService.createAgent(body);
    return { code: 0, data: result };
  }

  @Put('agents/:id')
  @ApiOperation({ summary: '更新AI智能体' })
  async updateAgent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      description?: string;
      config?: Record<string, any>;
      status?: string;
    },
  ) {
    const result = await this.adminService.updateAgent(id, body);
    return { code: 0, data: result };
  }

  // ==================== 对话记录管理 ====================
  @Get('chat-logs')
  @ApiOperation({ summary: '获取对话记录列表' })
  async getChatLogs(@Query() query: {
    page?: number;
    pageSize?: number;
    userId?: number;
    toolId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const result = await this.adminService.getChatLogs(query);
    return { code: 0, data: result };
  }

  // ==================== 圣力套餐管理 ====================
  @Get('coin-packages')
  @ApiOperation({ summary: '获取圣力套餐列表' })
  async getCoinPackages(@Query() query: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const result = await this.adminService.getCoinPackages(query);
    return { code: 0, data: result };
  }

  @Post('coin-packages')
  @ApiOperation({ summary: '创建圣力套餐' })
  async createCoinPackage(@Body() body: {
    name: string;
    coins: number;
    price: number;
    originalPrice?: number;
    description?: string;
    status?: string;
    sortOrder?: number;
  }) {
    const result = await this.adminService.createCoinPackage(body);
    return { code: 0, data: result };
  }

  @Put('coin-packages/:id')
  @ApiOperation({ summary: '更新圣力套餐' })
  async updateCoinPackage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      coins?: number;
      price?: number;
      originalPrice?: number;
      description?: string;
      status?: string;
      sortOrder?: number;
    },
  ) {
    const result = await this.adminService.updateCoinPackage(id, body);
    return { code: 0, data: result };
  }

  @Delete('coin-packages/:id')
  @ApiOperation({ summary: '删除圣力套餐（软删除）' })
  async deleteCoinPackage(@Param('id', ParseIntPipe) id: number) {
    const result = await this.adminService.deleteCoinPackage(id);
    return { code: 0, data: result };
  }

  // ==================== 敏感词管理 ====================
  @Get('sensitive-words')
  @ApiOperation({ summary: '获取敏感词列表' })
  async getSensitiveWords(@Query() query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const result = await this.adminService.getSensitiveWords(query);
    return { code: 0, data: result };
  }

  @Post('sensitive-words')
  @ApiOperation({ summary: '添加敏感词' })
  async addSensitiveWord(@Body() body: {
    word: string;
  }) {
    const result = await this.adminService.addSensitiveWord(body.word);
    return { code: 0, data: result };
  }

  @Delete('sensitive-words/:id')
  @ApiOperation({ summary: '删除敏感词' })
  async deleteSensitiveWord(@Param('id', ParseIntPipe) id: number) {
    const result = await this.adminService.deleteSensitiveWord(id);
    return { code: 0, data: result };
  }

  // ==================== 权限管理 ====================
  @Get('permissions')
  @ApiOperation({ summary: '获取权限列表' })
  async getPermissions() {
    const result = await this.adminService.getPermissions();
    return { code: 0, data: result };
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: '删除权限' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    const result = await this.adminService.deletePermission(id);
    return { code: 0, data: result };
  }
}
