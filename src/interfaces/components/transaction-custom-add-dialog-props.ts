import React from 'react';

interface TransactionCustomAddDialogProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
}

export default TransactionCustomAddDialogProps;
