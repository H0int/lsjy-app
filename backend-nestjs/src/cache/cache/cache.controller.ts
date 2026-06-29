import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Cache - 缓存管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取缓存统计信息' })
  async getStats() {
    const stats = await this.cacheService.getStats();
    return { code: 0, data: stats };
  }

  @Post('clear')
  @ApiOperation({ summary: '清除缓存' })
  async clearCache(@Body() body?: { type?: string }) {
    const result = await this.cacheService.clearCache(body?.type);
    return { code: 0, data: result };
  }
}
