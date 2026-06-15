import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ToolCategory } from '../database/entities/tool-category.entity';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { AiUserDailyQuota } from '../database/entities/ai-user-daily-quota.entity';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';

@Injectable()
export class AiToolsService {
  constructor(
    @InjectRepository(ToolCategory)
    private readonly categoryRepo: Repository<ToolCategory>,
    @InjectRepository(AiTool)
    private readonly toolRepo: Repository<AiTool>,
    @InjectRepository(AiCallRecord)
    private readonly callRecordRepo: Repository<AiCallRecord>,
    @InjectRepository(AiUserDailyQuota)
    private readonly quotaRepo: Repository<AiUserDailyQuota>,
    @InjectRepository(CoinAccount)
    private readonly coinAccountRepo: Repository<CoinAccount>,
    @InjectRepository(CoinTransaction)
    private readonly coinTxRepo: Repository<CoinTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getCategories(): Promise<ToolCategory[]> {
    return this.categoryRepo.find({
      where: { isVisible: 1, status: 'active' },
      order: { sortOrder: 'ASC' },
    });
  }

  async getTools(categoryId?: number, toolType?: string, page = 1, pageSize = 20): Promise<{ items: AiTool[]; total: number; page: number; pageSize: number }> {
    const qb = this.toolRepo.createQueryBuilder('tool')
      .where('tool.status = :status', { status: 'active' });

    if (categoryId) {
      qb.andWhere('tool.categoryId = :categoryId', { categoryId });
    }
    if (toolType) {
      qb.andWhere('tool.toolType = :toolType', { toolType });
    }

    qb.orderBy('tool.sortOrder', 'ASC').addOrderBy('tool.usageCount', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async getToolDetail(id: number): Promise<AiTool> {
    const tool = await this.toolRepo.findOne({ where: { id }, relations: ['category'] });
    if (!tool) throw new NotFoundException('工具不存在');
    return tool;
  }

  async callTool(userId: number, toolId: number, input: { text?: string; params?: Record<string, any>; files?: string[] }, ip?: string): Promise<AiCallRecord> {
    const tool = await this.toolRepo.findOne({ where: { id: toolId, status: 'active' } });
    if (!tool) throw new NotFoundException('工具不存在或已停用');

    // Check daily quota for free tools (before transaction)
    const today = new Date().toISOString().split('T')[0];
    const existingQuota = await this.quotaRepo.findOne({
      where: { userId, toolId, usageDate: today },
    });

    if (tool.isFree && tool.freeDailyLimit > 0) {
      if (existingQuota && existingQuota.callCount >= tool.freeDailyLimit) {
        throw new BadRequestException('今日免费次数已用完');
      }
    }

    // Use transaction for coin deduction + record creation
    return await this.dataSource.transaction(async (manager) => {
      // Check coin balance for paid tools (inside transaction)
      if (!tool.isFree && tool.coinCost > 0) {
        // Use raw query for balance check with row lock
        const accountRaw = await manager.query(
          'SELECT * FROM coin_accounts WHERE user_id = ? FOR UPDATE',
          [userId]
        );
        if (!accountRaw.length || accountRaw[0].balance < tool.coinCost) {
          throw new BadRequestException('圣力余额不足');
        }

        const balanceBefore = Number(accountRaw[0].balance);
        // Deduct coins
        await manager.query(
          'UPDATE coin_accounts SET balance = balance - ?, total_consumed = total_consumed + ? WHERE user_id = ?',
          [tool.coinCost, tool.coinCost, userId]
        );

        // Record transaction
        await manager.save(CoinTransaction, {
          userId,
          transactionType: 'consume',
          amount: -tool.coinCost,
          balanceBefore,
          balanceAfter: balanceBefore - tool.coinCost,
          refType: 'ai_tool_call',
          refId: toolId,
          remark: `调用AI工具: ${tool.name}`,
        });
      }

      // Create call record
      const callRecord = manager.create(AiCallRecord, {
        userId,
        toolId,
        requestId: uuidv4(),
        inputText: input.text || null,
        inputParams: input.params || null,
        inputFiles: input.files || null,
        modelUsed: tool.modelId,
        coinCost: tool.isFree ? 0 : tool.coinCost,
        status: 'processing',
        ipAddress: ip || null,
      });
      const savedRecord = await manager.save(callRecord);

      // Update quota
      let quota = existingQuota;
      if (!quota) {
        quota = manager.create(AiUserDailyQuota, { userId, toolId, usageDate: today, callCount: 0, coinSpent: 0 });
      }
      quota.callCount += 1;
      quota.coinSpent += tool.isFree ? 0 : tool.coinCost;
      await manager.save(quota);

      // Update tool usage count
      await manager.query(
        'UPDATE ai_tools SET usage_count = usage_count + 1 WHERE id = ?',
        [toolId]
      );

      return savedRecord;
    });
  }

  async getCallHistory(userId: number, page = 1, pageSize = 20): Promise<{ items: AiCallRecord[]; total: number; page: number; pageSize: number }> {
    const [items, total] = await this.callRecordRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async getCallDetail(userId: number, recordId: number): Promise<AiCallRecord> {
    const record = await this.callRecordRepo.findOne({
      where: { id: recordId, userId },
      relations: ['tool'],
    });
    if (!record) throw new NotFoundException('记录不存在');
    return record;
  }

  async toggleFavorite(userId: number, recordId: number): Promise<void> {
    const record = await this.callRecordRepo.findOne({ where: { id: recordId, userId } });
    if (!record) throw new NotFoundException('记录不存在');
    record.isFavorite = record.isFavorite ? 0 : 1;
    await this.callRecordRepo.save(record);
  }

  async getDailyQuota(userId: number, toolId: number): Promise<{ used: number; limit: number; date: string }> {
    const tool = await this.toolRepo.findOne({ where: { id: toolId } });
    if (!tool) throw new NotFoundException('工具不存在');

    const today = new Date().toISOString().split('T')[0];
    const quota = await this.quotaRepo.findOne({ where: { userId, toolId, usageDate: today } });

    return {
      used: quota?.callCount || 0,
      limit: tool.freeDailyLimit || 0,
      date: today,
    };
  }

  // Admin tool management
  async createTool(data: Partial<AiTool>): Promise<AiTool> {
    const item = this.toolRepo.create(data);
    return this.toolRepo.save(item);
  }

  async updateTool(id: number, data: Partial<AiTool>): Promise<AiTool> {
    const tool = await this.toolRepo.findOne({ where: { id } });
    if (!tool) throw new NotFoundException('工具不存在');
    Object.assign(tool, data);
    return this.toolRepo.save(tool);
  }

  async updateToolStatus(id: number, status: string): Promise<AiTool> {
    const tool = await this.toolRepo.findOne({ where: { id } });
    if (!tool) throw new NotFoundException('工具不存在');
    tool.status = status;
    return this.toolRepo.save(tool);
  }
}
