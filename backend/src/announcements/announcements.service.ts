import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Announcement } from '../database/entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async findAll(page = 1, pageSize = 20, status?: string) {
    const qb = this.announcementRepo.createQueryBuilder('a');
    if (status) qb.andWhere('a.status = :status', { status });
    qb.orderBy('a.isTop', 'DESC').addOrderBy('a.createdAt', 'DESC')
      .skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findActive() {
    return this.announcementRepo.find({
      where: { status: 'published' },
      order: { isTop: 'DESC', publishedAt: 'DESC' },
      take: 20,
    });
  }

  async findOne(id: number) {
    const item = await this.announcementRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    item.viewCount += 1;
    await this.announcementRepo.save(item);
    return item;
  }

  async create(data: Partial<Announcement>) {
    const item = this.announcementRepo.create(data);
    return this.announcementRepo.save(item);
  }

  async update(id: number, data: Partial<Announcement>) {
    const item = await this.announcementRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    Object.assign(item, data);
    return this.announcementRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.announcementRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    await this.announcementRepo.remove(item);
  }

  async publish(id: number, userId: number) {
    const item = await this.announcementRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    item.status = 'published';
    item.publishedAt = new Date();
    item.publishedBy = userId;
    return this.announcementRepo.save(item);
  }
}
