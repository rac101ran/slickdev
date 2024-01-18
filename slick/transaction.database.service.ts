import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionLedger } from './entities/transaction-ledger.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class TransactionLedgerDatabaseService {
  constructor(
    @InjectRepository(TransactionLedger)
    private transactionLedgerRepo: Repository<TransactionLedger>,
  ) {}

  async transactionsOfUser(userId: string) {
    try {
      return await this.transactionLedgerRepo.find({
        where: { userId: userId },
        select: ['amount'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async transactionOnThatDay(txnCheckDate: Date, userId: string) {
    try {
      const nextDay = new Date();
      nextDay.setUTCDate(txnCheckDate.getUTCDate() + 1);

      return await this.transactionLedgerRepo.find({
        where: { userId: userId, createdAt: Between(txnCheckDate, nextDay) },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async nTopUsersPerMonth(n: number, fromDate: Date, toDate: Date) {
    try {
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      return await this.transactionLedgerRepo
        .query(`SELECT user_id ,SUM(amount) AS TOTAL_TRANSACTION_AMOUNT
        FROM transaction_ledger WHERE (created_at >= '${fromDate.toDateString()}' AND created_at < '${toDate.toDateString()}')
        GROUP BY user_id
        ORDER BY TOTAL_TRANSACTION_AMOUNT DESC
        LIMIT ${n}`);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async transactionAmountsWithinPeriod(fromDate: Date, toDate: Date) {
    try {
      return await this.transactionLedgerRepo.query(`
            SELECT user_id , COUNT(*) AS TOTAL_TRANSACTIONS
            FROM transaction_ledger WHERE (created_at >= '${fromDate.toDateString()}' AND created_at < '${toDate.toDateString()}')
            GROUP BY user_id
         `);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async peakHourOfDay(date: Date) {
    try {
      const nextDay = new Date();
      nextDay.setUTCDate(date.getUTCDate() + 1);

      return await this.transactionLedgerRepo.find({
        where: {
          createdAt: Between(date, nextDay),
        },
        select: ['amount', 'createdAt'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async allUsersWithTransactionSum() {
    try {
      return await this.transactionLedgerRepo.query(
        `SELECT user_id , SUM(amount) AS total_transactions_amount , COUNT(*) AS total_transactions FROM transaction_ledger GROUP BY user_id`,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
