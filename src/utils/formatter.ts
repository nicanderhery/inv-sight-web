import Item from '../interfaces/entities/item';
import Transaction from '../interfaces/entities/transaction';
import Pair from '../interfaces/types';

export const unixToDate = (unix: number) => {
  const date = new Date(unix);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {
    date: `${day.toFixed(0).padStart(2, '0')}.${month.toFixed(0).padStart(2, '0')}.${year}`,
    time: `${date.getHours().toFixed(0).padStart(2, '0')}:${date
      .getMinutes()
      .toFixed(0)
      .padStart(2, '0')}`,
  };
};

export const numberToMoneyIndonesia = (number: number) => {
  return number.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
  });
};

const addPointEveryThreeDigits = (number: number) => {
  const numberString = number.toString();
  let result = '';

  // From the lowest, so from the right
  for (let i = numberString.length - 1; i >= 0; i -= 1) {
    result = numberString[i] + result;
    if ((numberString.length - i) % 3 === 0 && i !== 0) {
      result = '.' + result;
    }
  }

  return result;
};

const formatMoney = (price: number) => {
  return `${price < 0 ? '-' : ''}Rp ${addPointEveryThreeDigits(Math.abs(price))}`;
};

export const generateCsvTransactionReport = (
  transactions: Transaction[],
  inventory: Map<string, Pair<Item, number>>,
  balance?: number,
) => {
  // Deep copy the transactions and reverse it
  const reversedTransactions = (
    JSON.parse(JSON.stringify(transactions)) as Transaction[]
  ).reverse();

  // Deep copy the inventory
  const copyInventory = new Map<string, Pair<Item, number>>();
  inventory.forEach((pair, id) => {
    copyInventory.set(id, pair);
  });

  const transactionHeaders =
    'TANGGAL,JENIS TRANSAKSI,DESKRIPSI,NAMA,BERAT,MODEL,STOK LAMA,STOK BARU,MUTASI STOK,DEBIT,KREDIT,TOTAL MUTASI\n';
  const summaryHeaders = 'DATA SALDO\nSALDO AWAL,SALDO AKHIR\n';
  const itemHeaders = 'DATA BARANG\nNAMA,BERAT,MODEL,STOK LAMA,STOK BARU\n';

  let csvData = transactionHeaders;
  let totalPrice = 0;

  reversedTransactions.forEach((transaction) => {
    const { date } = unixToDate(transaction.createdAt);
    const quantityBefore = copyInventory.get(transaction.data?.item.id ?? '')?.second ?? '';
    const quantityAfter =
      quantityBefore === '' || !transaction.data
        ? ''
        : quantityBefore + (transaction.debit ? -1 : 1) * transaction.data.quantity;
    totalPrice += (transaction.debit ? 1 : -1) * transaction.price;

    csvData += `${date},${transaction.debit ? 'Pendapatan' : 'Pengeluaran'},${
      transaction.description
    },${transaction.data?.item.name ?? ''},${transaction.data?.item.weight ?? ''},${
      transaction.data?.item.model ?? ''
    },${quantityBefore},${quantityAfter},${transaction.data?.quantity ?? ''},${
      transaction.debit
        ? `${formatMoney(transaction.price)},`
        : `,${formatMoney(transaction.price)}`
    },${formatMoney(totalPrice)}\n`;

    // Update the quantity
    if (quantityAfter !== '' && transaction.data != undefined) {
      copyInventory.set(transaction.data.item.id, {
        first: transaction.data.item,
        second: quantityAfter,
      });
    }
  });

  if (balance != undefined) {
    csvData += `\n${summaryHeaders}`;
    csvData += `${formatMoney(balance)},${formatMoney(balance + totalPrice)}\n`;
  }

  csvData += '\nHIRAUKAN JIKA TIDAK MEMILIH SEMUA';
  csvData += `\n${itemHeaders}`;
  inventory.forEach((pair, id) => {
    const newQuantity = copyInventory.get(id)!.second;
    csvData += `${pair.first.name},${pair.first.weight},${pair.first.model},${pair.second},${newQuantity}\n`;
  });

  return csvData;
};
