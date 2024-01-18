import { customAlphabet } from 'nanoid';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

// TransactionID (unique identifier for each transaction)
// UserID (unique identifier for each user)
// Amount (transaction amount in dollars)
// Timestamp (the time when the transaction occurred)

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEF12345678', 8);

@Entity({ name: 'transaction_ledger' })
export class TransactionLedger {
  @PrimaryColumn({ name: 'transaction_id' })
  transactionId: string = nanoid();

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'amount' })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
