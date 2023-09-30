import { ref } from 'firebase/database';
import { database } from '../firebase';

/**
 * Get reference to a store from realtime database
 * @param storeId Store ID
 * @constructor
 */
export const DBRefStore = (storeId: string) => {
  return ref(database, `stores/${storeId}`);
};

/**
 * Get reference to store ids that a user is managing from realtime database
 * @param uid User ID
 * @constructor
 */
export const DBRefManagerStores = (uid: string) => {
  return ref(database, `managers/${uid}`);
};

/**
 * Get reference to a store id that a user is managing from realtime database
 * @param uid User ID
 * @param storeId Store ID
 * @constructor
 */
export const DBRefManagerStore = (uid: string, storeId: string) => {
  return ref(database, `managers/${uid}/${storeId}`);
};

/**
 * Get reference to transactions of a store from realtime database
 * @param storeId Store ID
 * @constructor
 */
export const DBRefTransactions = (storeId: string) => {
  return ref(database, `transactions/${storeId}`);
};

/**
 * Get reference to a transaction of a store from realtime database
 * @param storeId Store ID
 * @param transactionId Transaction ID
 * @constructor
 */
export const DBRefTransaction = (storeId: string, transactionId: string) => {
  return ref(database, `transactions/${storeId}/${transactionId}`);
};
