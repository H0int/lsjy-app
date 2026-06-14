import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../database/entities/faq.entity';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
  ) {}

  async findAll(page = 1, pageSize = 20, category?: string) {
    const qb = this.faqRepo.createQueryBuilder('f').where('f.status = :status', { status: 'active' });
    if (category) qb.andWhere('f.category = :category', { category });
    qb.orderBy('f.sortOrder', 'ASC').addOrderBy('f.viewCount', 'DESC')
      .skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findAllAdmin(page = 1, pageSize = 20, status?: string) {
    const qb = this.faqRepo.createQueryBuilder('f');
    if (status) qb.andWhere('f.status = :status', { status });
    qb.orderBy('f.sortOrder', 'ASC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.faqRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('FAQ不存在');
    item.viewCount += 1;
    await this.faqRepo.save(item);
    return item;
  }

  async create(data: Partial<Faq>) {
    const item = this.faqRepo.create(data);
    return this.faqRepo.save(item);
  }

  async update(id: number, data: Partial<Faq>) {
    const item = await this.faqRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('FAQ不存在');
    Object.assign(item, data);
    return this.faqRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.faqRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('FAQ不存在');
    await this.faqRepo.remove(item);
  }
}
