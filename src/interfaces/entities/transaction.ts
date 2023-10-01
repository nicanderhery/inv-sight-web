import BaseEntity from './base-entity';
import TransactionData from './transaction-data';

interface Transaction extends BaseEntity {
  data?: TransactionData;
  description: string;
  price: number;
  debit: boolean;
  doneBy: string;
}

export default Transaction;
