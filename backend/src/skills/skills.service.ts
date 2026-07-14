import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { ConfigService } from '@nestjs/config';

export interface SkillStatus {
  name: string;
  displayName: string;
  available: boolean;
  endpoint: string;
  description: string;
}

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(AiCallRecord)
    private readonly callRecordRepo: Repository<AiCallRecord>,
    private readonly configService: ConfigService,
  ) {}

  /** Crawl4AI: 网页爬取 */
  async crawl(url: string, params?: { outputFormat?: string; excludeImages?: boolean }): Promise<any> {
    const startTime = Date.now();
    try {
      const res = await fetch('http://127.0.0.1:11235/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Token': this.configService.get('CRAWL4AI_API_TOKEN', 'lsjy_crawl4ai_2026_secret') },
        body: JSON.stringify({ url, output_format: params?.outputFormat || 'markdown', exclude_images: params?.excludeImages ?? true }),
      });
      const data = await res.json();
      return { success: true, data, durationMs: Date.now() - startTime };
    } catch (error: any) {
      this.logger.error(`Crawl4AI调用失败: ${error.message}`);
      throw new HttpException(`网页爬取服务暂不可用: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /** Whisper: 语音转文字 (接收已上传的音频URL) */
  async transcribe(audioUrl: string, language?: string): Promise<any> {
    const startTime = Date.now();
    try {
      const res = await fetch('http://127.0.0.1:9000/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: audioUrl, language: language || 'zh' }),
      });
      const data = await res.json();
      return { success: true, data, durationMs: Date.now() - startTime };
    } catch (error: any) {
      this.logger.error(`Whisper调用失败: ${error.message}`);
      throw new HttpException(`语音识别服务暂不可用: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /** Tabby: 代码补全 */
  async codeCompletion(code: string, language?: string): Promise<any> {
    const startTime = Date.now();
    try {
      const res = await fetch('http://127.0.0.1:8089/v1/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language || 'javascript', segments: { prefix: code } }),
      });
      const data = await res.json();
      return { success: true, data, durationMs: Date.now() - startTime };
    } catch (error: any) {
      this.logger.error(`Tabby调用失败: ${error.message}`);
      throw new HttpException(`代码补全服务暂不可用: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /** 获取所有技能状态 */
  async getSkillsStatus(): Promise<SkillStatus[]> {
    const skills = [
      { name: 'crawl4ai', displayName: 'AI网页爬虫', endpoint: 'http://127.0.0.1:11235', description: '输入URL自动爬取网页内容，输出LLM友好的Markdown' },
      { name: 'whisper', displayName: 'AI语音识别', endpoint: 'http://127.0.0.1:9000', description: '语音转文字，支持99+语言，包括中文、英文、日文等' },
      { name: 'tabby', displayName: 'AI编程助手', endpoint: 'http://127.0.0.1:8089', description: '代码智能补全，支持VSCode/JetBrains插件接入' },
    ];

    const results: SkillStatus[] = [];
    for (const skill of skills) {
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(`${skill.endpoint}/`, { method: 'GET', signal: ctrl.signal });
        clearTimeout(timeout);
        results.push({ ...skill, available: res.ok });
      } catch {
        results.push({ ...skill, available: false });
      }
    }
    return results;
  }

  /** 记录技能调用 */
  async recordCall(userId: number, skillName: string, input: any, output: any, durationMs: number, status: string, error?: string): Promise<void> {
    try {
      const record = this.callRecordRepo.create({
        userId,
        toolId: this.getSkillToolId(skillName),
        requestId: `skill_${skillName}_${Date.now()}_${userId}`,
        inputText: typeof input === 'string' ? input : JSON.stringify(input),
        inputParams: typeof input === 'object' ? input : null,
        outputText: typeof output === 'string' ? output : JSON.stringify(output),
        modelUsed: skillName,
        durationMs,
        status: status as any,
        errorMessage: error || null,
      });
      await this.callRecordRepo.save(record);
    } catch (e: any) {
      this.logger.error(`记录技能调用失败: ${e.message}`);
    }
  }

  private getSkillToolId(skillName: string): number {
    const map: Record<string, number> = { crawl4ai: 99001, whisper: 99002, tabby: 99003 };
    return map[skillName] || 99000;
  }
}
