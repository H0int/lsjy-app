import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentModeration } from '../database/entities/content-moderation.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ContentModeration)
    private readonly moderationRepo: Repository<ContentModeration>,
  ) {}

  async findAll(page = 1, pageSize = 20, status?: string, contentType?: string) {
    const qb = this.moderationRepo.createQueryBuilder('m');
    if (status) qb.andWhere('m.status = :status', { status });
    else qb.andWhere('m.status = :status', { status: 'pending' });
    if (contentType) qb.andWhere('m.contentType = :contentType', { contentType });
    qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.moderationRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    return item;
  }

  async approve(id: number, reviewerId: number) {
    const item = await this.moderationRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    if (item.status !== 'pending') throw new BadRequestException('该内容已审核');
    item.status = 'approved';
    item.reviewedBy = reviewerId;
    item.reviewedAt = new Date();
    return this.moderationRepo.save(item);
  }

  async reject(id: number, reviewerId: number, reason: string) {
    const item = await this.moderationRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    if (item.status !== 'pending') throw new BadRequestException('该内容已审核');
    item.status = 'rejected';
    item.reviewedBy = reviewerId;
    item.reviewedAt = new Date();
    item.rejectReason = reason;
    return this.moderationRepo.save(item);
  }

  async flag(id: number, reason: string) {
    const item = await this.moderationRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('内容不存在');
    item.status = 'flagged';
    item.flagReason = reason;
    return this.moderationRepo.save(item);
  }
}
