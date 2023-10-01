import React from 'react';
import Item from '../entities/item';
import Pair from '../types';

interface ItemBuySellDialogProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  stock: Pair<Item, number> | undefined;
  sell: boolean;
}

export default ItemBuySellDialogProps;
