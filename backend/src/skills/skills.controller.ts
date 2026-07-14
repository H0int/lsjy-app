import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /** 获取所有技能状态 */
  @Get('status')
  async getStatus() {
    const skills = await this.skillsService.getSkillsStatus();
    return { code: 0, message: 'ok', data: skills };
  }

  /** Crawl4AI: 网页爬取 */
  @Post('crawl')
  @HttpCode(HttpStatus.OK)
  async crawl(@Body() body: { url: string; outputFormat?: string; excludeImages?: boolean }, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 0;
    const startTime = Date.now();
    try {
      // 扣除200圣力
      const hasEnough = await this.skillsService.checkCoins(userId);
      if (!hasEnough) {
        throw new BadRequestException('圣力不足，使用技能需要消耗200圣力');
      }
      await this.skillsService.deductCoins(userId, 'crawl4ai');

      const result = await this.skillsService.crawl(body.url, {
        outputFormat: body.outputFormat,
        excludeImages: body.excludeImages,
      });
      await this.skillsService.recordCall(userId, 'crawl4ai', body, result.data, result.durationMs, 'completed');
      return { code: 0, message: 'ok', data: result.data };
    } catch (error: any) {
      await this.skillsService.recordCall(userId, 'crawl4ai', body, null, Date.now() - startTime, 'failed', error.message);
      throw error;
    }
  }

  /** Whisper: 语音转文字 */
  @Post('whisper/transcribe')
  @HttpCode(HttpStatus.OK)
  async transcribe(@Body() body: { audioUrl: string; language?: string }, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 0;
    const startTime = Date.now();
    try {
      // 扣除200圣力
      const hasEnough = await this.skillsService.checkCoins(userId);
      if (!hasEnough) {
        throw new BadRequestException('圣力不足，使用技能需要消耗200圣力');
      }
      await this.skillsService.deductCoins(userId, 'whisper');

      const result = await this.skillsService.transcribe(body.audioUrl, body.language);
      await this.skillsService.recordCall(userId, 'whisper', body, result.data, result.durationMs, 'completed');
      return { code: 0, message: 'ok', data: result.data };
    } catch (error: any) {
      await this.skillsService.recordCall(userId, 'whisper', body, null, Date.now() - startTime, 'failed', error.message);
      throw error;
    }
  }

  /** Tabby: 代码补全 */
  @Post('tabby/completions')
  @HttpCode(HttpStatus.OK)
  async codeCompletion(@Body() body: { code: string; language?: string }, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || 0;
    const startTime = Date.now();
    try {
      // 扣除200圣力
      const hasEnough = await this.skillsService.checkCoins(userId);
      if (!hasEnough) {
        throw new BadRequestException('圣力不足，使用技能需要消耗200圣力');
      }
      await this.skillsService.deductCoins(userId, 'tabby');

      const result = await this.skillsService.codeCompletion(body.code, body.language);
      await this.skillsService.recordCall(userId, 'tabby', body, result.data, result.durationMs, 'completed');
      return { code: 0, message: 'ok', data: result.data };
    } catch (error: any) {
      await this.skillsService.recordCall(userId, 'tabby', body, null, Date.now() - startTime, 'failed', error.message);
      throw error;
    }
  }
}
