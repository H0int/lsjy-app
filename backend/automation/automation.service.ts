import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from '../database/entities/automation-rule.entity';
import { AutomationRuleLog } from '../database/entities/automation-rule-log.entity';

@Injectable()
export class AutomationService {
  constructor(
    @InjectRepository(AutomationRule)
    private readonly ruleRepo: Repository<AutomationRule>,
    @InjectRepository(AutomationRuleLog)
    private readonly logRepo: Repository<AutomationRuleLog>,
  ) {}

  async findAllRules(page = 1, pageSize = 20) {
    const [items, total] = await this.ruleRepo.findAndCount({
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findOneRule(id: number) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('规则不存在');
    return rule;
  }

  async createRule(data: Partial<AutomationRule>) {
    const item = this.ruleRepo.create(data);
    return this.ruleRepo.save(item);
  }

  async updateRule(id: number, data: Partial<AutomationRule>) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('规则不存在');
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  async toggleRule(id: number) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('规则不存在');
    rule.status = rule.status === 'active' ? 'disabled' : 'active';
    return this.ruleRepo.save(rule);
  }

  async removeRule(id: number) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('规则不存在');
    await this.ruleRepo.remove(rule);
  }

  async getRuleLogs(ruleId: number, page = 1, pageSize = 20) {
    const [items, total] = await this.logRepo.findAndCount({
      where: { ruleId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }
}
