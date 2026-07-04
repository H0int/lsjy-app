import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { CoinAccount } from "../database/entities/coin-account.entity";
import { CoinTransaction } from "../database/entities/coin-transaction.entity";

@Injectable()
export class CoinConsumptionService {
  private readonly logger = new Logger(CoinConsumptionService.name);

  constructor(
    @InjectRepository(CoinAccount)
    private readonly coinAccountRepo: Repository<CoinAccount>,
    @InjectRepository(CoinTransaction)
    private readonly coinTxRepo: Repository<CoinTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async consume(
    userId: number,
    amount: number,
    refType: string,
    refId?: number | string,
    remark?: string,
  ): Promise<{ success: boolean; balanceAfter: number }> {
    if (amount <= 0) throw new BadRequestException("Amount must be positive");

    const result = await this.dataSource.transaction(async (manager) => {
      const lockedAccount = await manager.query(
        "SELECT * FROM coin_accounts WHERE user_id = ? FOR UPDATE", [userId]
      );
      if (!lockedAccount.length) throw new BadRequestException("Account not found");

      const balance = Number(lockedAccount[0].balance);
      if (balance < amount) throw new BadRequestException("Insufficient balance");

      const balanceBefore = balance;
      const balanceAfter = balance - amount;

      await manager.query(
        "UPDATE coin_accounts SET balance = balance - ?, total_consumed = total_consumed + ? WHERE user_id = ?",
        [amount, amount, userId]
      );

      await manager.save(CoinTransaction, {
        userId,
        transactionType: "consumption",
        amount: -amount,
        balanceBefore,
        balanceAfter,
        refType,
        refId: refId ? Number(refId) : null,
        remark: remark || refType + " consumption",
      });

      return { success: true, balanceAfter };
    });

    this.logger.log("User " + userId + " consumed " + amount + " coins, balance: " + result.balanceAfter);
    return result;
  }

  async checkBalance(userId: number, amount: number): Promise<boolean> {
    const account = await this.coinAccountRepo.findOne({
      where: { userId, status: "active" },
    });
    if (!account) return false;
    return Number(account.balance) >= amount;
  }
}
