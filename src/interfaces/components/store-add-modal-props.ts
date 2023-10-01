import React from 'react';

export interface StoreAddModalProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
}
