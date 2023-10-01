import React from 'react';
import { Item } from '../entities/item';
import Pair from '../types';

export interface ItemCardProps {
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  stock: Pair<Item, number>;
  setStock: React.Dispatch<React.SetStateAction<Pair<Item, number> | undefined>>;
  setSell: React.Dispatch<React.SetStateAction<boolean>>;
}
