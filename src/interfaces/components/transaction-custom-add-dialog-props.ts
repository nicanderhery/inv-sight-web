import React from 'react';

export interface TransactionCustomAddDialogProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
}
