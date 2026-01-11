export const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euras' },
  { code: 'USD', symbol: '$', name: 'JAV doleris' },
  { code: 'GBP', symbol: '£', name: 'Svaras' },
  { code: 'PLN', symbol: 'zł', name: 'Zlotas' },
  { code: 'LTL', symbol: 'Lt', name: 'Litas' },
];

export const getCurrencySymbol = (code: string): string => {
  return currencies.find(c => c.code === code)?.symbol || code;
};

// Paprastas valiutų keitimas (realiame projekte reikėtų naudoti API)
export const exchangeRates: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  PLN: 0.23,
  LTL: 0.29,
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
  if (from === to) return amount;
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;
  return (amount / fromRate) * toRate;
};
