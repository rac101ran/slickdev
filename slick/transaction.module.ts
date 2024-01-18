import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLedger } from './entities/transaction-ledger.entity';
import { TransactionLedgerService } from './transaction.service';
import { TransactionLedgerDatabaseService } from './transaction.database.service';
import { TransactionsController } from '../transaction/transaction.controller';
import { TransactionControllerLedger } from './transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLedger])],
  providers: [TransactionLedgerService, TransactionLedgerDatabaseService],
  controllers : [TransactionControllerLedger]
})
export class TransactionLedgerModule {}
