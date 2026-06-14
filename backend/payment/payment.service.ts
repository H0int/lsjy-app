import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinRechargePackage } from '../database/entities/coin-recharge-package.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';
import { Order } from '../database/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(CoinAccount)
    private readonly coinAccountRepo: Repository<CoinAccount>,
    @InjectRepository(CoinRechargePackage)
    private readonly packageRepo: Repository<CoinRechargePackage>,
    @InjectRepository(CoinTransaction)
    private readonly coinTxRepo: Repository<CoinTransaction>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTxRepo: Repository<PaymentTransaction>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(userId: number): Promise<CoinAccount> {
    let account = await this.coinAccountRepo.findOne({ where: { userId } });
    if (!account) {
      account = this.coinAccountRepo.create({ userId, balance: 0 });
      account = await this.coinAccountRepo.save(account);
    }
    return account;
  }

  async getPackages(): Promise<CoinRechargePackage[]> {
    return this.packageRepo.find({
      where: { status: 'active' },
      order: { sortOrder: 'ASC' },
    });
  }

  async createRecharge(userId: number, packageId: number): Promise<{ paymentTransaction: PaymentTransaction; coinAmount: number }> {
    const pkg = await this.packageRepo.findOne({ where: { id: packageId, status: 'active' } });
    if (!pkg) throw new NotFoundException('充值套餐不存在');

    const account = await this.getBalance(userId);
    const totalCoins = pkg.coinAmount + pkg.bonusCoins;

    // Create payment transaction
    const paymentTx = this.paymentTxRepo.create({
      transactionNo: `PAY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId,
      bizType: 'recharge',
      payChannel: 'wechat', // Default, will be updated on callback
      amount: pkg.price,
      coinAmount: totalCoins,
      direction: 'in',
      status: 'pending',
      remark: `充值: ${pkg.name}`,
    });
    const savedTx = await this.paymentTxRepo.save(paymentTx);

    return { paymentTransaction: savedTx, coinAmount: totalCoins };
  }

  async confirmRecharge(transactionId: number, payChannel: string, channelTradeNo?: string): Promise<void> {
    // 幂等性检查：先查询状态，如果已处理则直接返回
    const paymentTx = await this.paymentTxRepo.findOne({ where: { id: transactionId } });
    if (!paymentTx) {
      throw new BadRequestException('交易不存在');
    }
    if (paymentTx.status !== 'pending') {
      // 已经处理过，直接返回（幂等）
      return;
    }

    // 使用事务包裹整个确认流程
    await this.dataSource.transaction(async (manager) => {
      // 行锁锁定支付记录，防止并发
      const lockedTx = await manager.query(
        'SELECT * FROM payment_transactions WHERE id = ? FOR UPDATE',
        [transactionId]
      );
      if (!lockedTx.length || lockedTx[0].status !== 'pending') {
        throw new BadRequestException('交易不存在或已处理');
      }

      // Update payment transaction
      await manager.query(
        `UPDATE payment_transactions SET status = 'success', pay_channel = ?, channel_trade_no = ?, paid_at = NOW() WHERE id = ?`,
        [payChannel, channelTradeNo || null, transactionId]
      );

      // 行锁锁定账户
      const lockedAccount = await manager.query(
        'SELECT * FROM coin_accounts WHERE user_id = ? FOR UPDATE',
        [paymentTx.userId]
      );
      if (!lockedAccount.length) throw new BadRequestException('账户不存在');

      const balanceBefore = Number(lockedAccount[0].balance);
      const coinAmount = Number(paymentTx.coinAmount);

      // Update coin account
      await manager.query(
        'UPDATE coin_accounts SET balance = balance + ?, total_recharge = total_recharge + ? WHERE user_id = ?',
        [coinAmount, coinAmount, paymentTx.userId]
      );

      // Create coin transaction
      await manager.save(CoinTransaction, {
        userId: paymentTx.userId,
        transactionType: 'recharge',
        amount: coinAmount,
        balanceBefore,
        balanceAfter: balanceBefore + coinAmount,
        refType: 'recharge',
        refId: paymentTx.id,
        paymentTransactionId: paymentTx.id,
        remark: paymentTx.remark,
      });
    });
  }

  async getTransactions(userId: number, type?: string, page = 1, pageSize = 20): Promise<{ items: CoinTransaction[]; total: number; page: number; pageSize: number }> {
    const qb = this.coinTxRepo.createQueryBuilder('tx')
      .where('tx.userId = :userId', { userId });

    if (type) {
      qb.andWhere('tx.transactionType = :type', { type });
    }

    qb.orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async getPaymentOrders(userId: number, page = 1, pageSize = 20): Promise<{ items: PaymentTransaction[]; total: number; page: number; pageSize: number }> {
    const [items, total] = await this.paymentTxRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  // Admin order management
  async getAllOrders(page = 1, pageSize = 20, status?: string): Promise<{ items: Order[]; total: number; page: number; pageSize: number }> {
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items');
    if (status) qb.andWhere('o.status = :status', { status });
    qb.orderBy('o.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async getOrderDetail(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async confirmOrder(id: number, operatorId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'paid' && order.status !== 'pending_pay') {
      throw new BadRequestException('订单状态不允许确认');
    }
    order.status = 'completed';
    order.completedAt = new Date();
    return this.orderRepo.save(order);
  }
}
