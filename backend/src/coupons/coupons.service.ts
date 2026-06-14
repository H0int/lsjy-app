import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../database/entities/coupon.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async findAll(page = 1, pageSize = 20, status?: string) {
    const qb = this.couponRepo.createQueryBuilder('c');
    if (status) qb.andWhere('c.status = :status', { status });
    qb.orderBy('c.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.couponRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('优惠券不存在');
    return item;
  }

  async create(data: Partial<Coupon>) {
    if (!data.code) {
      data.code = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    }
    const existing = await this.couponRepo.findOne({ where: { code: data.code } });
    if (existing) throw new ConflictException('优惠码已存在');
    const item = this.couponRepo.create(data);
    return this.couponRepo.save(item);
  }

  async update(id: number, data: Partial<Coupon>) {
    const item = await this.couponRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('优惠券不存在');
    Object.assign(item, data);
    return this.couponRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.couponRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('优惠券不存在');
    await this.couponRepo.remove(item);
  }

  async updateStatus(id: number, status: string) {
    const item = await this.couponRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('优惠券不存在');
    item.status = status;
    return this.couponRepo.save(item);
  }
}
