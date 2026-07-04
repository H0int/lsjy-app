import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../database/entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
  ) {}

  async findAll(page = 1, pageSize = 20, status?: string) {
    const qb = this.campaignRepo.createQueryBuilder('c');
    if (status) qb.andWhere('c.status = :status', { status });
    qb.orderBy('c.priority', 'DESC').addOrderBy('c.createdAt', 'DESC')
      .skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findActive() {
    return this.campaignRepo.find({
      where: { status: 'active' },
      order: { priority: 'DESC' },
      take: 10,
    });
  }

  async findOne(id: number) {
    const item = await this.campaignRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('活动不存在');
    return item;
  }

  async create(data: Partial<Campaign>) {
    const item = this.campaignRepo.create(data);
    return this.campaignRepo.save(item);
  }

  async update(id: number, data: Partial<Campaign>) {
    const item = await this.campaignRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('活动不存在');
    Object.assign(item, data);
    return this.campaignRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.campaignRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('活动不存在');
    await this.campaignRepo.remove(item);
  }

  async updateStatus(id: number, status: string) {
    const item = await this.campaignRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('活动不存在');
    item.status = status;
    return this.campaignRepo.save(item);
  }
}
