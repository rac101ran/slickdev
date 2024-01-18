import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionLedgerDatabaseService } from './transaction.database.service';
import { formatDate } from 'src/constant';

export interface PotentialUsers {
  user: string;
  increaseRate: number;
}

@Injectable()
export class TransactionLedgerService {
  constructor(
    private transactionDatabaseService: TransactionLedgerDatabaseService,
  ) {}

  async averageTransactionAmount(userId: string) {
    try {
      let avgTransactionOfUser = 0;
      const txnOfUser =
        await this.transactionDatabaseService.transactionsOfUser(userId);

      if (txnOfUser.length === 0) {
        return {
          status: 200,
          message: 'transaction of user',
          data: {
            averageTransactions: 0,
          },
        };
      }

      for (let t = 0; t < txnOfUser.length; t++) {
        avgTransactionOfUser += txnOfUser[t].amount;
      }

      return {
        status: 200,
        message: 'transaction of user',
        data: {
          averageTransactions: avgTransactionOfUser / txnOfUser.length,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async transactionsForSpecificDay(date: string, userId: string) {
    try {
      console.log(new Date(date));

      const txn = await this.transactionDatabaseService.transactionOnThatDay(
        new Date(date),
        userId,
      );

      let totAmount = 0;

      for (let i = 0; i < txn.length; i++) totAmount += txn[i].amount;

      return {
        status: 200,
        message: `transactions for day ${formatDate(new Date(date))}`,
        data: {
          totalAmount: totAmount,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async nTopUsersThisMonth(n: number) {
    try {
      const currentDate = new Date();
      const lastMonthDate = new Date(
        currentDate.getTime() - 1000 * 60 * 60 * 24 * 30,
      );

      const topNMonthlyUsers =
        await this.transactionDatabaseService.nTopUsersPerMonth(
          n,
          lastMonthDate,
          currentDate,
        );
      return {
        status: 200,
        message: 'top n users',
        data: topNMonthlyUsers,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async potentialUsers(date: string) {
    try {
      const dateTill = new Date();
      dateTill.setUTCDate(new Date(date).getUTCDate() + 1);
      const dateFromPastMonth = new Date(
        dateTill.getTime() - 60 * 60 * 1000 * 24 * 30,
      );
      const dateStartPastMonth = new Date(
        dateTill.getTime() - 60 * 60 * 1000 * 24 * 60,
      );

      const responseCurrentMonth =
        await this.transactionDatabaseService.transactionAmountsWithinPeriod(
          dateFromPastMonth,
          dateTill,
        );

      const responsePastMonth =
        await this.transactionDatabaseService.transactionAmountsWithinPeriod(
          dateStartPastMonth,
          dateFromPastMonth,
        );

      console.log(responseCurrentMonth, ' ', responsePastMonth);

      const potentialUsersCandidates = new Map<string, number>();

      const potentialUsers: PotentialUsers[] = [];

      for (let i = 0; i < responsePastMonth.length; i++) {
        potentialUsersCandidates.set(
          responsePastMonth[i].user_id,
          Number(responsePastMonth[i].total_transactions),
        );
      }

      for (let i = 0; i < responseCurrentMonth.length; i++) {
        if (
          potentialUsersCandidates.has(responseCurrentMonth[i].user_id) &&
          potentialUsersCandidates.get(responseCurrentMonth[i].user_id) <
            Number(responseCurrentMonth[i].total_transactions)
        ) {
          potentialUsers.push({
            user: responseCurrentMonth[i].user_id,
            increaseRate:
              ((Number(responseCurrentMonth[i].total_transactions) -
                potentialUsersCandidates.get(responseCurrentMonth[i].user_id)) /
                potentialUsersCandidates.get(responseCurrentMonth[i].user_id)) *
              100,
          });
        }
      }

      return {
        status: 200,
        message: 'potential users',
        data: potentialUsers,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async peakHourService(date: string) {
    try {
      const dayStart = new Date(date);
      dayStart.setUTCHours(0);
      dayStart.setUTCMinutes(0);
      dayStart.setUTCSeconds(0);

      const dailyTransactions =
        await this.transactionDatabaseService.peakHourOfDay(dayStart);

      const peakHourStat = new Map<number, number>();

      let peakHourCandidate = 0,
        maxTransactionAmountForHour = 0;

      for (let t = 0; t < dailyTransactions.length; t++) {
        const hour = dailyTransactions[t].createdAt.getUTCHours();
        if (peakHourStat.has(hour)) {
          const prevTxnAmounts = peakHourStat.get(hour);
          peakHourStat.set(hour, prevTxnAmounts + dailyTransactions[t].amount);

          if (
            prevTxnAmounts + dailyTransactions[t].amount >
            maxTransactionAmountForHour
          ) {
            peakHourCandidate = hour;
            maxTransactionAmountForHour =
              prevTxnAmounts + dailyTransactions[t].amount;
          }
        } else {
          peakHourStat.set(hour, dailyTransactions[t].amount);

          if (dailyTransactions[t].amount > maxTransactionAmountForHour) {
            peakHourCandidate = hour;
            maxTransactionAmountForHour = dailyTransactions[t].amount;
          }
        }
      }

      return {
        status: 200,
        message: 'peak hour received.',
        data: {
          peakHour: `${peakHourCandidate} is the peak hour`,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async loyaltyScoreOfUser() {
    try {
      const users =
        await this.transactionDatabaseService.allUsersWithTransactionSum();

      const baseRatingAmountWeight = 0.5;
      const baseRatingFrequencyWeight = 0.5;

      const response: any[] = [];

      for (let u = 0; u < users.length; u++) {
        const loyaltyScore =
          baseRatingAmountWeight * Number(users[u].total_transactions_amount) +
          baseRatingFrequencyWeight * Number(users[u].total_transactions);

        response.push({ userId: users[u].user_id, loyaltyScore: loyaltyScore });
      }

      return {
        status: 200,
        message: 'users loyalty score',
        data: response,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
