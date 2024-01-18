// 1. `/avg-trans-amt` : Compute the average transaction amount.
// 2. `/all-trans`: Allow the user to input a specific date and retrieve all transactions that occurred on that date.
// 3. `/top-users`: Find the top N users who have transferred the highest total amount in a month.
// 4. `/potential-users`: Identify users whose number of transactions has increased over the last month compared to the previous month.
// 5. `/hightest-trans-hour`: Find the hour of the day with the highest total transaction amount. Consider both peak hours and non-peak hours.
// 6. `/loyalty-score`: Calculate a loyalty score for each user based on the number of transactions and the total amount transferred.
//Define a formula that considers both frequency and monetary aspects.

import { Controller, Get, Query, Req, ValidationPipe } from '@nestjs/common';
import { TransactionLedgerService } from './transaction.service';
import { Public } from 'src/common/customDecorators/isPublic.decorator';

@Controller('txn')
export class TransactionControllerLedger {
  constructor(private readonly transactionService: TransactionLedgerService) {}

  @Get('avg-trans-amt')
  async averageTxnAmount(@Req() req: Request) {
    return await this.transactionService.averageTransactionAmount(
      req['userId'],
    );
  }
  @Get('all_trans')
  async allTransForThatDay(
    @Req() req: Request,
    @Query() query: { date: string },
  ) {
    return await this.transactionService.transactionsForSpecificDay(
      query.date,
      req['userId'],
    );
  }

  @Get('top-users')
  @Public()
  async findTopUsers(@Query() query: { n: number }) {
    return await this.transactionService.nTopUsersThisMonth(Number(query.n));
  }

  @Get('/potential-users')
  @Public()
  async findPotentialUsers(@Query() query: { date: string }) {
    return await this.transactionService.potentialUsers(query.date);
  }

  @Get('/hightest-trans-hour')
  @Public()
  async dailyPeakHour(@Query(new ValidationPipe()) query: { date: string }) {
    return await this.transactionService.peakHourService(query.date);
  }

  @Get('/loyalty-score')
  @Public()
  async localtyScore() {
    return await this.transactionService.loyaltyScoreOfUser();
  }
}
