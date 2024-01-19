import { customAlphabet } from 'nanoid';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

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
  @Index()
  createdAt: Date;
}
