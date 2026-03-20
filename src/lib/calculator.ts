import { Instalment } from '@/types';
import { addMonths, format } from 'date-fns';

export const APR = 9.5;

export function calculateMonthlyInstalment(principal: number, n: number, apr: number = APR): number {
  const r = apr / 100 / 12;
  const instalment = principal * r / (1 - Math.pow(1 + r, -n));
  return Math.round(instalment * 100) / 100;
}

export function calculateTotalInterest(principal: number, n: number, apr: number = APR): number {
  const instalment = calculateMonthlyInstalment(principal, n, apr);
  return Math.round((instalment * n - principal) * 100) / 100;
}

export function calculateInstalments(
  premiumAmount: number,
  downPaymentPercent: number,
  instalmentCount: number,
  startDate: Date = new Date()
): Instalment[] {
  const downPayment = premiumAmount * (downPaymentPercent / 100);
  const financedAmount = premiumAmount - downPayment;
  const monthlyAmount = calculateMonthlyInstalment(financedAmount, instalmentCount);

  return Array.from({ length: instalmentCount }, (_, i) => ({
    id: `inst-${Date.now()}-${i + 1}`,
    agreementId: '',
    number: i + 1,
    amount: monthlyAmount,
    dueDate: format(addMonths(startDate, i + 1), 'yyyy-MM-dd'),
    status: 'upcoming' as const,
  }));
}

export function formatCurrency(amount: number, currencyLocale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
