import Item from '../entities/item';
import Transaction from '../entities/transaction';
import Pair from '../types';

interface ItemRenameModalProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  items: Item[];
  stock: Pair<Item, number> | undefined;
  transactions: Transaction[];
}

export default ItemRenameModalProps;
