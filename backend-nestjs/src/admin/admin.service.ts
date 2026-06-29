import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { CoinRechargePackage } from '../database/entities/coin-recharge-package.entity';
import { SensitiveWord } from '../entities/sensitive-word.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AiTool)
    private readonly aiToolRepository: Repository<AiTool>,
    @InjectRepository(AiCallRecord)
    private readonly aiCallRecordRepository: Repository<AiCallRecord>,
    @InjectRepository(CoinRechargePackage)
    private readonly coinPackageRepository: Repository<CoinRechargePackage>,
    @InjectRepository(SensitiveWord)
    private readonly sensitiveWordRepository: Repository<SensitiveWord>,
  ) {}

  // ==================== AI智能体管理 ====================
  async getAgents(query: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    keyword?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const qb = this.aiToolRepository.createQueryBuilder('tool')
      .where('tool.type = :type', { type: query.type || 'agent' });

    if (query.status) {
      qb.andWhere('tool.status = :status', { status: query.status });
    }

    if (query.keyword) {
      qb.andWhere('(tool.name LIKE :keyword OR tool.description LIKE :keyword)', {
        keyword: `%${query.keyword}%`,
      });
    }

    const [items, total] = await qb
      .orderBy('tool.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createAgent(body: {
    name: string;
    description?: string;
    type: string;
    config?: Record<string, any>;
    status?: string;
  }) {
    const agent = this.aiToolRepository.create({
      name: body.name,
      description: body.description,
      type: body.type || 'agent',
      config: body.config || {},
      status: body.status || 'active',
    });
    return await this.aiToolRepository.save(agent);
  }

  async updateAgent(id: number, body: {
    name?: string;
    description?: string;
    config?: Record<string, any>;
    status?: string;
  }) {
    const agent = await this.aiToolRepository.findOne({ where: { id } });
    if (!agent) {
      throw new Error('AI智能体不存在');
    }

    if (body.name !== undefined) agent.name = body.name;
    if (body.description !== undefined) agent.description = body.description;
    if (body.config !== undefined) agent.config = body.config;
    if (body.status !== undefined) agent.status = body.status;

    return await this.aiToolRepository.save(agent);
  }

  // ==================== 对话记录管理 ====================
  async getChatLogs(query: {
    page?: number;
    pageSize?: number;
    userId?: number;
    toolId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const qb = this.aiCallRecordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .leftJoinAndSelect('record.tool', 'tool');

    if (query.userId) {
      qb.andWhere('record.userId = :userId', { userId: query.userId });
    }

    if (query.toolId) {
      qb.andWhere('record.toolId = :toolId', { toolId: query.toolId });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('record.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    const [items, total] = await qb
      .orderBy('record.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ==================== 圣力套餐管理 ====================
  async getCoinPackages(query: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const qb = this.coinPackageRepository.createQueryBuilder('pkg')
      .where('pkg.status != :deletedStatus', { deletedStatus: 'deleted' });

    if (query.status) {
      qb.andWhere('pkg.status = :status', { status: query.status });
    }

    const [items, total] = await qb
      .orderBy('pkg.sortOrder', 'ASC')
      .addOrderBy('pkg.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createCoinPackage(body: {
    name: string;
    coins: number;
    price: number;
    originalPrice?: number;
    description?: string;
    status?: string;
    sortOrder?: number;
  }) {
    const pkg = this.coinPackageRepository.create({
      name: body.name,
      coins: body.coins,
      price: body.price,
      originalPrice: body.originalPrice,
      description: body.description,
      status: body.status || 'active',
      sortOrder: body.sortOrder || 0,
    });
    return await this.coinPackageRepository.save(pkg);
  }

  async updateCoinPackage(id: number, body: {
    name?: string;
    coins?: number;
    price?: number;
    originalPrice?: number;
    description?: string;
    status?: string;
    sortOrder?: number;
  }) {
    const pkg = await this.coinPackageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new Error('圣力套餐不存在');
    }

    Object.assign(pkg, body);
    return await this.coinPackageRepository.save(pkg);
  }

  async deleteCoinPackage(id: number) {
    const pkg = await this.coinPackageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new Error('圣力套餐不存在');
    }

    pkg.status = 'deleted';
    await this.coinPackageRepository.save(pkg);
    return { success: true, message: '删除成功' };
  }

  // ==================== 敏感词管理 ====================
  async getSensitiveWords(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const qb = this.sensitiveWordRepository.createQueryBuilder('sw');

    if (query.keyword) {
      qb.andWhere('sw.word LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    const [items, total] = await qb
      .orderBy('sw.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async addSensitiveWord(word: string) {
    // 检查是否已存在
    const existing = await this.sensitiveWordRepository.findOne({
      where: { word },
    });
    if (existing) {
      throw new Error('敏感词已存在');
    }

    const sensitiveWord = this.sensitiveWordRepository.create({ word });
    return await this.sensitiveWordRepository.save(sensitiveWord);
  }

  async deleteSensitiveWord(id: number) {
    const result = await this.sensitiveWordRepository.delete({ id });
    if (result.affected === 0) {
      throw new Error('敏感词不存在');
    }
    return { success: true, message: '删除成功' };
  }

  // ==================== 权限管理 ====================
  async getPermissions() {
    // 从数据库或配置中获取权限列表
    // 这里返回示例权限列表，实际可能需要从角色权限关联表获取
    const permissions = [
      { id: 1, code: 'user:read', name: '查看用户', category: '用户管理' },
      { id: 2, code: 'user:write', name: '管理用户', category: '用户管理' },
      { id: 3, code: 'order:read', name: '查看订单', category: '订单管理' },
      { id: 4, code: 'order:write', name: '管理订单', category: '订单管理' },
      { id: 5, code: 'agent:read', name: '查看智能体', category: '智能体管理' },
      { id: 6, code: 'agent:write', name: '管理智能体', category: '智能体管理' },
      { id: 7, code: 'package:read', name: '查看套餐', category: '套餐管理' },
      { id: 8, code: 'package:write', name: '管理套餐', category: '套餐管理' },
      { id: 9, code: 'report:view', name: '查看报表', category: '报表管理' },
      { id: 10, code: 'settings:manage', name: '系统设置', category: '系统管理' },
    ];
    return permissions;
  }

  async deletePermission(id: number) {
    // 实际实现可能需要检查是否有角色在使用该权限
    return { success: true, message: '权限删除成功' };
  }
}
