import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../database/entities/system-config.entity';
import { OperationLog } from '../database/entities/operation-log.entity';
import { Notification } from '../database/entities/notification.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    @InjectRepository(OperationLog)
    private readonly logRepo: Repository<OperationLog>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // System Config
  async getPublicConfigs(): Promise<SystemConfig[]> {
    return this.configRepo.find({ where: { isPublic: 1 } });
  }

  async getAllConfigs(): Promise<SystemConfig[]> {
    return this.configRepo.find({ order: { configGroup: 'ASC', configKey: 'ASC' } });
  }

  async getConfig(key: string): Promise<string | null> {
    const config = await this.configRepo.findOne({ where: { configKey: key } });
    return config?.configValue || null;
  }

  async updateConfig(key: string, value: string, updatedBy?: number): Promise<SystemConfig> {
    let config = await this.configRepo.findOne({ where: { configKey: key } });
    if (!config) throw new NotFoundException('配置项不存在');
    config.configValue = value;
    config.updatedBy = updatedBy || null;
    return this.configRepo.save(config);
  }

  // Operation Logs
  async getLogs(page = 1, pageSize = 20, module?: string): Promise<{ items: OperationLog[]; total: number; page: number; pageSize: number }> {
    const qb = this.logRepo.createQueryBuilder('log');
    if (module) qb.where('log.module = :module', { module });
    qb.orderBy('log.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async createLog(data: Partial<OperationLog>): Promise<OperationLog> {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  // Notifications
  async getUserNotifications(userId: number, page = 1, pageSize = 20): Promise<{ items: Notification[]; total: number; page: number; pageSize: number }> {
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async markAsRead(userId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({ where: { id: notificationId, userId } });
    if (!notification) throw new NotFoundException('通知不存在');
    notification.isRead = 1;
    notification.readAt = new Date();
    await this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: 0 }, { isRead: 1, readAt: new Date() });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: 0 } });
  }
}
