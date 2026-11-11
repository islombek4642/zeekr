import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    const code = cleaned.slice(3, 5);
    const part1 = cleaned.slice(5, 8);
    const part2 = cleaned.slice(8, 10);
    const part3 = cleaned.slice(10, 12);
    return `+998 (${code}) ${part1}-${part2}-${part3}`;
  }

  if (cleaned.length === 9) {
    const code = cleaned.slice(0, 2);
    const part1 = cleaned.slice(2, 5);
    const part2 = cleaned.slice(5, 7);
    const part3 = cleaned.slice(7, 9);
    return `+998 (${code}) ${part1}-${part2}-${part3}`;
  }

  return phone;
}

export function formatCurrencyUSD(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyUZS(amountUSD: number, rate: number): string {
  if (
    amountUSD === undefined ||
    amountUSD === null ||
    isNaN(amountUSD) ||
    rate === undefined ||
    rate === null ||
    isNaN(rate)
  ) {
    return "0 so'm";
  }
  const uzs = Math.round(amountUSD * rate);
  const formatted = uzs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formatted} so'm`;
}
