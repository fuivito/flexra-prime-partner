import { Agreement } from '@/types';

export interface EarlySettlementQuote {
  remainingInstalments: number;
  remainingBalance: number;
  interestRebate: number;
  settlementAmount: number;
  saving: number;
  savingPercent: number;
}

/**
 * Calculates early settlement using the Rule of 78 (Sum of Digits) method,
 * which is standard in UK premium finance.
 *
 * The rebate is calculated as the proportion of unearned interest based on
 * the remaining term relative to the original term.
 */
export function calculateEarlySettlement(agreement: Agreement, apr: number = 9.5): EarlySettlementQuote {
  const downPayment = agreement.premiumAmount * (agreement.downPaymentPercent / 100);
  const financed = agreement.premiumAmount - downPayment;
  const totalInterest = financed * (apr / 100) * (agreement.instalmentCount / 12);

  const upcomingInstalments = agreement.instalments.filter(i => i.status === 'upcoming');
  const overdueInstalments = agreement.instalments.filter(i => i.status === 'overdue');
  const remainingInstalments = upcomingInstalments.length + overdueInstalments.length;
  const remainingBalance = [...upcomingInstalments, ...overdueInstalments].reduce((s, i) => s + i.amount, 0);

  // Rule of 78 rebate calculation
  const n = agreement.instalmentCount;
  const sumOfDigits = (n * (n + 1)) / 2;
  const paidCount = agreement.instalments.filter(i => i.status === 'paid').length;
  const earnedDigits = Array.from({ length: paidCount }, (_, i) => n - i).reduce((s, v) => s + v, 0);
  const unearnedDigits = sumOfDigits - earnedDigits;
  const interestRebate = totalInterest * (unearnedDigits / sumOfDigits);

  const settlementAmount = Math.max(0, remainingBalance - interestRebate);
  const saving = remainingBalance - settlementAmount;
  const savingPercent = remainingBalance > 0 ? (saving / remainingBalance) * 100 : 0;

  return {
    remainingInstalments,
    remainingBalance,
    interestRebate,
    settlementAmount,
    saving,
    savingPercent,
  };
}
