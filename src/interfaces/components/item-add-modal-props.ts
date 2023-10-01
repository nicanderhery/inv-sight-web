import React from 'react';
import Item from '../entities/item';

interface ItemAddModalProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  items: Item[];
}

export default ItemAddModalProps;
