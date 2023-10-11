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
  const itemHeaders = 'DATA BARANG\nNAMA,BERAT,MODEL,STOK LAMA,STOK BARU,TOTAL BERAT\n';

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

  const getTotalWeight = (weight: string, quantity: number) => {
    const weightUnits = ['gram', 'gr', 'suku', 'sk'];
    const fractionMap = new Map<string, number>([
      ['½', 0.5],
      ['⅓', 0.33],
      ['⅔', 0.67],
      ['¼', 0.25],
      ['¾', 0.75],
      ['⅕', 0.2],
      ['⅖', 0.4],
      ['⅗', 0.6],
      ['⅘', 0.8],
      ['⅙', 0.17],
      ['⅚', 0.83],
      ['⅐', 0.14],
      ['⅛', 0.13],
      ['⅜', 0.38],
      ['⅝', 0.63],
      ['⅞', 0.88],
      ['⅑', 0.11],
      ['⅒', 0.1],
    ]);
    const unit = weightUnits.find((unit) => weight.toLocaleLowerCase().endsWith(unit));
    if (!unit) {
      return undefined;
    }

    // Remove the weight unit
    const cleanedWeight = weight.replaceAll(' ', '').toLocaleLowerCase().replace(unit, '');

    let totalWeight = 0;
    let fractionExist = false;
    let end = false;
    Array.from(cleanedWeight).map((char) => {
      if (end) {
        // The counting should end when a fraction is found
        return;
      }

      // Check whether it is an unicode fraction
      const unicodeFraction = fractionMap.get(char);
      if (unicodeFraction) {
        // If it is an unicode fraction, then add it to the total weight and end the loop
        totalWeight += unicodeFraction;
        end = true;
        return;
      }

      // Check whether the char is a number
      const number = parseInt(char);
      if (isNaN(number)) {
        // If not a number, then it must be a fraction
        fractionExist = true;
        return;
      }

      // If a fraction exist, then the number is the denominator, so divide the total weight by the number
      // and end the loop
      if (fractionExist) {
        totalWeight = totalWeight / number;
        end = true;
        return;
      }

      // If previous weight is not a fraction, then multiply it by 10 and add the number
      if (totalWeight) {
        totalWeight *= 10;
      }
      totalWeight += number;
    });
    return {
      totalWeight: totalWeight * quantity,
      unitWeight: unit,
    };
  };

  const totalWeightOfAllUnits = new Map<string, number>();

  csvData += '\nHIRAUKAN JIKA TIDAK MEMILIH SEMUA';
  csvData += `\n${itemHeaders}`;
  Array.from(inventory.values())
    .sort((a, b) =>
      `${a.first.name}${a.first.weight}${a.first.model}`
        .replaceAll(' ', '')
        .toLocaleLowerCase()
        .localeCompare(
          `${b.first.name}${b.first.weight}${b.first.model}`
            .replaceAll(' ', '')
            .toLocaleLowerCase(),
        ),
    )
    .forEach((pair) => {
      const newQuantity = copyInventory.get(pair.first.id)!.second;
      const totalWeight = getTotalWeight(pair.first.weight, newQuantity);
      if (totalWeight) {
        const prevWeight = totalWeightOfAllUnits.get(totalWeight.unitWeight) ?? 0;
        totalWeightOfAllUnits.set(totalWeight.unitWeight, prevWeight + totalWeight.totalWeight);
      }
      csvData += `${pair.first.name},${pair.first.weight},${pair.first.model},${
        pair.second
      },${newQuantity},${
        totalWeight ? `${totalWeight.totalWeight} ${totalWeight.unitWeight}` : ''
      }\n`;
    });
  csvData += '\nTOTAL BERAT SELURUH BARANG\n';
  totalWeightOfAllUnits.forEach((weight, unit) => {
    csvData += `${weight} ${unit}\n`;
  });

  return csvData;
};
