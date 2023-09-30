import { BaseEntity } from './base-entity';
import { TransactionData } from './transaction-data';

export interface Transaction extends BaseEntity {
  data?: TransactionData;
  description: string;
  price: number;
  debit: boolean;
  doneBy: string;
}
