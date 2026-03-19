import { Instalment } from '@/types';
import { addMonths, format } from 'date-fns';

export function calculateInstalments(
  premiumAmount: number,
  downPaymentPercent: number,
  instalmentCount: number,
  startDate: Date = new Date()
): Instalment[] {
  const downPayment = premiumAmount * (downPaymentPercent / 100);
  const financedAmount = premiumAmount - downPayment;
  const monthlyAmount = financedAmount / instalmentCount;

  return Array.from({ length: instalmentCount }, (_, i) => ({
    id: `inst-${Date.now()}-${i + 1}`,
    agreementId: '',
    number: i + 1,
    amount: Math.round(monthlyAmount * 100) / 100,
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
