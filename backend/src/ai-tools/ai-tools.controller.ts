import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AiToolsService } from './ai-tools.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ai-tools')
@Controller('ai')
export class AiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: '获取工具分类列表' })
  async getCategories() {
    const categories = await this.aiToolsService.getCategories();
    return { data: categories };
  }

  @Public()
  @Get('tools')
  @ApiOperation({ summary: '获取AI工具列表' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'toolType', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getTools(
    @Query('categoryId') categoryId?: number,
    @Query('toolType') toolType?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.aiToolsService.getTools(categoryId, toolType, page, pageSize);
    return { data: result };
  }

  @Public()
  @Get('tools/:id')
  @ApiOperation({ summary: '获取工具详情' })
  async getToolDetail(@Param('id') id: number) {
    const tool = await this.aiToolsService.getToolDetail(id);
    return { data: tool };
  }

  @UseGuards(JwtAuthGuard)
  @Post('tools/:id/call')
  @ApiBearerAuth()
  @ApiOperation({ summary: '调用AI工具' })
  async callTool(
    @CurrentUser('id') userId: number,
    @Param('id') toolId: number,
    @Body() input: { text?: string; params?: Record<string, any>; files?: string[] },
  ) {
    const record = await this.aiToolsService.callTool(userId, toolId, input);
    return { data: record };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取调用历史' })
  async getHistory(
    @CurrentUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const result = await this.aiToolsService.getCallHistory(userId, page, pageSize);
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取调用详情' })
  async getHistoryDetail(
    @CurrentUser('id') userId: number,
    @Param('id') id: number,
  ) {
    const record = await this.aiToolsService.getCallDetail(userId, id);
    return { data: record };
  }

  @UseGuards(JwtAuthGuard)
  @Post('history/:id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏/取消收藏' })
  async toggleFavorite(
    @CurrentUser('id') userId: number,
    @Param('id') id: number,
  ) {
    await this.aiToolsService.toggleFavorite(userId, id);
    return { data: { message: '操作成功' } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('quota/:toolId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询每日配额' })
  async getQuota(
    @CurrentUser('id') userId: number,
    @Param('toolId') toolId: number,
  ) {
    const quota = await this.aiToolsService.getDailyQuota(userId, toolId);
    return { data: quota };
  }
}
