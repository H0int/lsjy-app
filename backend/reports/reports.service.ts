import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Order } from '../database/entities/order.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(CoinTransaction) private readonly coinTxRepo: Repository<CoinTransaction>,
    @InjectRepository(AiCallRecord) private readonly aiCallRepo: Repository<AiCallRecord>,
    @InjectRepository(PaymentTransaction) private readonly paymentTxRepo: Repository<PaymentTransaction>,
  ) {}

  async getOverview() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' } });
    const newUsersToday = await this.userRepo
      .createQueryBuilder('u')
      .where('DATE(u.created_at) = CURDATE()')
      .getCount();

    const totalOrders = await this.orderRepo.count();
    const todayOrders = await this.orderRepo
      .createQueryBuilder('o')
      .where('DATE(o.created_at) = CURDATE()')
      .getCount();
    const todayRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.pay_amount)', 'total')
      .where('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .andWhere('DATE(o.created_at) = CURDATE()')
      .getRawOne();

    const totalAiCalls = await this.aiCallRepo.count();
    const todayAiCalls = await this.aiCallRepo
      .createQueryBuilder('a')
      .where('DATE(a.created_at) = CURDATE()')
      .getCount();

    const totalRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.pay_amount)', 'total')
      .where('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .getRawOne();

    return {
      users: { total: totalUsers, active: activeUsers, newToday: newUsersToday },
      orders: { total: totalOrders, today: todayOrders },
      revenue: {
        today: Number(todayRevenue?.total) || 0,
        total: Number(totalRevenue?.total) || 0,
      },
      ai: { totalCalls: totalAiCalls, todayCalls: todayAiCalls },
    };
  }

  async getTrend(days = 7) {
    const userTrend = await this.userRepo
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`u.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const orderTrend = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(o.pay_amount)', 'revenue')
      .where(`o.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const aiTrend = await this.aiCallRepo
      .createQueryBuilder('a')
      .select('DATE(a.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`a.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      users: userTrend.map(r => ({ date: r.date, count: Number(r.count) })),
      orders: orderTrend.map(r => ({ date: r.date, count: Number(r.count), revenue: Number(r.revenue) || 0 })),
      ai: aiTrend.map(r => ({ date: r.date, count: Number(r.count) })),
    };
  }

  async getRevenue(days = 30) {
    const byChannel = await this.paymentTxRepo
      .createQueryBuilder('p')
      .select('p.payChannel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: 'success' })
      .andWhere('p.direction = :direction', { direction: 'in' })
      .andWhere(`p.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .groupBy('p.payChannel')
      .getRawMany();

    const byBizType = await this.paymentTxRepo
      .createQueryBuilder('p')
      .select('p.bizType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: 'success' })
      .andWhere(`p.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .groupBy('p.bizType')
      .getRawMany();

    const dailyRevenue = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.created_at)', 'date')
      .addSelect('SUM(o.pay_amount)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .where(`o.created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)`, { days })
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      byChannel: byChannel.map(r => ({ channel: r.channel, count: Number(r.count), total: Number(r.total) || 0 })),
      byBizType: byBizType.map(r => ({ type: r.type, count: Number(r.count), total: Number(r.total) || 0 })),
      daily: dailyRevenue.map(r => ({ date: r.date, revenue: Number(r.revenue) || 0, count: Number(r.count) })),
    };
  }
}
