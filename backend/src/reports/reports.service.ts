import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Order } from '../database/entities/order.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { AiTool } from '../database/entities/ai-tool.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(CoinTransaction) private readonly coinTxRepo: Repository<CoinTransaction>,
    @InjectRepository(AiCallRecord) private readonly aiCallRepo: Repository<AiCallRecord>,
    @InjectRepository(AiTool) private readonly aiToolRepo: Repository<AiTool>,
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

  async getAdminDashboard() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    // 用户统计
    const activeUsers = await this.userRepo.count({ where: { status: 'active' } });
    const newUsersToday = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :todayStart AND u.created_at < :tomorrowStart', { todayStart, tomorrowStart })
      .getCount();
    const newUsersYesterday = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :yesterdayStart AND u.created_at < :todayStart', { yesterdayStart, todayStart })
      .getCount();

    // 营收统计
    const todayRevenueRaw = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.pay_amount)', 'total')
      .where('o.created_at >= :todayStart AND o.created_at < :tomorrowStart', { todayStart, tomorrowStart })
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .getRawOne();
    const todayRevenue = Number(todayRevenueRaw?.total) || 0;

    const yesterdayRevenueRaw = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.pay_amount)', 'total')
      .where('o.created_at >= :yesterdayStart AND o.created_at < :todayStart', { yesterdayStart, todayStart })
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .getRawOne();
    const yesterdayRevenue = Number(yesterdayRevenueRaw?.total) || 0;

    // 圣力消耗 (amount为负数表示消耗)
    const coinConsumedRaw = await this.coinTxRepo
      .createQueryBuilder('c')
      .select('SUM(ABS(c.amount))', 'total')
      .where('c.created_at >= :todayStart AND c.created_at < :tomorrowStart', { todayStart, tomorrowStart })
      .andWhere('c.amount < 0')
      .getRawOne();
    const coinConsumed = Number(coinConsumedRaw?.total) || 0;

    const yesterdayCoinRaw = await this.coinTxRepo
      .createQueryBuilder('c')
      .select('SUM(ABS(c.amount))', 'total')
      .where('c.created_at >= :yesterdayStart AND c.created_at < :todayStart', { yesterdayStart, todayStart })
      .andWhere('c.amount < 0')
      .getRawOne();
    const yesterdayCoin = Number(yesterdayCoinRaw?.total) || 0;

    // API错误率 - 仅统计终态记录(completed+failed)，排除pending/processing/cancelled
    const completedAiCalls = await this.aiCallRepo.count({ where: { status: 'completed' } });
    const failedAiCalls = await this.aiCallRepo.count({ where: { status: 'failed' } });
    const terminalAiCalls = completedAiCalls + failedAiCalls;
    const apiErrorRate = terminalAiCalls >= 5
      ? ((failedAiCalls / terminalAiCalls) * 100).toFixed(2)
      : '0.00';

    // 支付失败率 - 仅统计终态记录(success+failed)，排除pending/refunded
    const successPaymentTx = await this.paymentTxRepo.count({ where: { status: 'success' } });
    const failedPaymentTx = await this.paymentTxRepo.count({ where: { status: 'failed' } });
    const terminalPaymentTx = successPaymentTx + failedPaymentTx;
    const paymentFailureRate = terminalPaymentTx >= 5
      ? ((failedPaymentTx / terminalPaymentTx) * 100).toFixed(2)
      : '0.00';

    // 变化率计算
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    // 7天趋势
    const trendDays = 7;
    const userTrend = await this.userRepo
      .createQueryBuilder('u')
      .select('DATE(u.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`u.created_at >= DATE_SUB(CURDATE(), INTERVAL ${trendDays} DAY)`)
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const revenueTrend = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.created_at)', 'date')
      .addSelect('SUM(o.pay_amount)', 'revenue')
      .where(`o.created_at >= DATE_SUB(CURDATE(), INTERVAL ${trendDays} DAY)`)
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'received', 'completed'] })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 生成完整日期序列
    const dates: string[] = [];
    const newUsers: number[] = [];
    const revenue: number[] = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
      const userRow = userTrend.find(r => String(r.date).startsWith(dateStr));
      const revRow = revenueTrend.find(r => String(r.date).startsWith(dateStr));
      newUsers.push(userRow ? Number(userRow.count) : 0);
      revenue.push(revRow ? Number(revRow.revenue) || 0 : 0);
    }

    return {
      realtimeStats: [
        { label: '在线用户', value: activeUsers },
        { label: '今日注册', value: newUsersToday },
        { label: '今日营收', value: todayRevenue },
        { label: '圣力消耗', value: coinConsumed },
      ],
      onlineUsersChange: calcChange(activeUsers, activeUsers), // 简化：活跃用户变化
      todayRegistrationsChange: calcChange(newUsersToday, newUsersYesterday),
      todayRevenueChange: calcChange(todayRevenue, yesterdayRevenue),
      energyConsumptionChange: calcChange(coinConsumed, yesterdayCoin),
      apiErrorRate,
      paymentFailureRate,
      trend: { dates, newUsers, revenue },
      modules: [], // 简化：模块数据需要额外查询
      topTools: [], // 简化：工具排行需要额外查询
      topProducts: [], // 简化：商品排行需要额外查询
      recentLogs: [], // 简化：日志需要额外表
    };
  }

  async getApiErrors(status?: string, pageSize = 20) {
    // 前端用 status='pending' 表示"待处理"，实际对应 ai_call_records 的 status='failed'
    const dbStatus = status === 'pending' ? 'failed' : (status || 'failed');

    const qb = this.aiCallRepo.createQueryBuilder('a')
      .leftJoin('ai_tools', 't', 't.id = a.tool_id')
      .select([
        'a.id', 'a.request_id', 'a.status', 'a.error_message',
        'a.model_used', 'a.created_at',
        't.name AS toolName', 't.provider AS apiProvider',
      ])
      .where('a.status = :dbStatus', { dbStatus })
      .orderBy('a.created_at', 'DESC')
      .take(pageSize);

    const list = await qb.getRawMany();
    const total = await this.aiCallRepo.count({ where: { status: dbStatus } });

    // 映射: ai_call_records.status='failed' → 前端显示为 'pending'(待修复)
    const mapped = list.map(r => ({
      id: r.a_id,
      requestId: r.a_request_id,
      toolName: r.toolName || '未知工具',
      apiProvider: r.apiProvider || '未知',
      errorMessage: r.a_error_message || '未知错误',
      modelUsed: r.a_model_used,
      createdAt: r.a_created_at,
      status: r.a_status === 'failed' ? 'pending' : 'resolved',
    }));

    return { list: mapped, total, page: 1, pageSize };
  }

  async updateApiError(id: number, body: any) {
    // 前端发送 status='resolved'，映射为 ai_call_records 的 'completed'
    const updateData = { ...body };
    if (updateData.status === 'resolved') updateData.status = 'completed';
    if (updateData.status === 'ignored') updateData.status = 'cancelled';
    await this.aiCallRepo.update(id, updateData);
    return { id, ...updateData };
  }

  async retryApiError(id: number) {
    const record = await this.aiCallRepo.findOne({ where: { id } });
    if (!record) throw new Error('记录不存在');
    await this.aiCallRepo.update(id, { status: 'pending' });
    return { id, status: 'pending' };
  }

  async getPaymentFailures(status?: string, pageSize = 20) {
    // 前端用 status='pending' 表示"待处理"，实际对应 payment_transactions 的 status='failed'
    const dbStatus = status === 'pending' ? 'failed' : (status || 'failed');

    const [list, total] = await this.paymentTxRepo.findAndCount({
      where: { status: dbStatus },
      order: { createdAt: 'DESC' },
      take: pageSize,
    });

    // 映射字段: 前端期望 orderId/amount/paymentMethod/errorMessage/status
    const mapped = list.map(r => ({
      id: r.id,
      transactionNo: r.transactionNo,
      orderId: r.orderId,
      amount: r.amount,
      paymentMethod: r.payChannel,
      errorMessage: r.remark || '支付失败',
      createdAt: r.createdAt,
      status: r.status === 'failed' ? 'pending' : 'resolved',
    }));

    return { list: mapped, total, page: 1, pageSize };
  }

  async updatePaymentFailure(id: number, body: any) {
    // 前端发送 status='resolved'，映射为 payment_transactions 的 'success'
    const updateData = { ...body };
    if (updateData.status === 'resolved') updateData.status = 'success';
    await this.paymentTxRepo.update(id, updateData);
    return { id, ...updateData };
  }

  async retryPaymentFailure(id: number) {
    const record = await this.paymentTxRepo.findOne({ where: { id } });
    if (!record) throw new Error('记录不存在');
    await this.paymentTxRepo.update(id, { status: 'pending' });
    return { id, status: 'pending' };
  }

  async getOnlineUsers() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const onlineUsers = await this.userRepo
      .createQueryBuilder('user')
      .where('user.updatedAt >= :date', { date: threeDaysAgo })
      .select(['user.id', 'user.username', 'user.nickname', 'user.updatedAt', 'user.status'])
      .orderBy('user.updatedAt', 'DESC')
      .limit(50)
      .getMany();

    const mapped = onlineUsers.map(u => ({
      userId: u.id,
      username: u.username,
      nickname: u.nickname,
      lastActive: u.updatedAt,
      status: u.status,
    }));

    return { items: mapped, list: mapped, total: mapped.length };
  }
}
