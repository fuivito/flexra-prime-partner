import { Client, Agreement, ActivityItem, User, Instalment, InstalmentStatus } from '@/types';
import { format, addMonths, subMonths, subDays, startOfMonth, isBefore, startOfDay } from 'date-fns';

// ── Date helpers ────────────────────────────────────────────────────
const today = startOfDay(new Date());
const d = (date: Date) => format(date, 'yyyy-MM-dd');

/** 1st of the month, N months before today */
const monthStart = (monthsAgo: number) => startOfMonth(subMonths(today, monthsAgo));

/** Specific day of the month, N months before today */
function monthDay(monthsAgo: number, day: number): Date {
  const m = subMonths(today, monthsAgo);
  return new Date(m.getFullYear(), m.getMonth(), day);
}

/** Count how many monthly instalments (from firstDue) fall before today */
function countPast(firstDue: Date, count: number): number {
  let n = 0;
  for (let i = 0; i < count; i++) {
    if (isBefore(addMonths(firstDue, i), today)) n++;
  }
  return n;
}

/**
 * Generate a monthly instalment schedule.
 *   1…paidCount  → paid
 *   past-due after paidCount → overdue
 *   future → upcoming
 */
function makeInstalments(
  agrNum: string,
  agreementId: string,
  count: number,
  amount: number,
  firstDue: Date,
  paidCount: number,
  lastAmount?: number,
): Instalment[] {
  return Array.from({ length: count }, (_, i) => {
    const dueDate = addMonths(firstDue, i);
    const isPast = isBefore(dueDate, today);
    const num = i + 1;

    let status: InstalmentStatus;
    let paidDate: string | undefined;

    if (num <= paidCount) {
      status = 'paid';
      paidDate = d(subDays(dueDate, (num % 2) + 1));
    } else if (isPast) {
      status = 'overdue';
    } else {
      status = 'upcoming';
    }

    return {
      id: `i-${agrNum}-${i + 1}`,
      agreementId,
      number: num,
      amount: i === count - 1 && lastAmount !== undefined ? lastAmount : amount,
      dueDate: d(dueDate),
      status,
      ...(paidDate ? { paidDate } : {}),
    };
  });
}

// ── Users ───────────────────────────────────────────────────────────
export const mockBrokerUser: User = {
  id: 'broker-1',
  name: 'Sarah Mitchell',
  email: 'sarah@flexra.com',
  role: 'broker',
  company: 'Flexra Insurance Services',
};

export const mockPolicyholderUser: User = {
  id: 'ph-1',
  name: 'James Chen',
  email: 'james@techcorp.com',
  role: 'policyholder',
  company: 'TechCorp Solutions',
  phone: '+1 (555) 234-5678',
};

// ── Clients ─────────────────────────────────────────────────────────
export const mockClients: Client[] = [
  {
    id: 'client-1',
    companyName: 'TechCorp Solutions',
    contactPerson: 'James Chen',
    email: 'james@techcorp.com',
    phone: '+1 (555) 234-5678',
    businessType: 'Technology',
    companyRegNumber: '08745231',
    createdAt: d(subDays(today, 300)),
  },
  {
    id: 'client-2',
    companyName: 'Green Valley Construction',
    contactPerson: 'Maria Rodriguez',
    email: 'maria@greenvalley.com',
    phone: '+1 (555) 345-6789',
    businessType: 'Construction',
    companyRegNumber: '11294076',
    createdAt: d(subDays(today, 120)),
  },
  {
    id: 'client-3',
    companyName: 'Pinnacle Healthcare',
    contactPerson: 'Dr. Robert Kim',
    email: 'rkim@pinnacle.com',
    phone: '+1 (555) 456-7890',
    businessType: 'Healthcare',
    companyRegNumber: '06381952',
    createdAt: d(subDays(today, 210)),
  },
  {
    id: 'client-4',
    companyName: 'Atlas Logistics',
    contactPerson: 'Nina Patel',
    email: 'nina@atlaslogistics.com',
    phone: '+1 (555) 567-8901',
    businessType: 'Logistics',
    createdAt: d(subDays(today, 56)),
  },
];

// ── Instalments (computed once, shared with Italian locale) ─────────

// agr-1: TechCorp — 12 monthly, only #1 paid → rest overdue / upcoming
const agr1Due = monthStart(2);

// agr-2: Green Valley — 6 monthly on the 15th, all past paid
const agr2Due = monthDay(1, 15);

// agr-3: Pinnacle — 12 monthly, all past paid
const agr3Due = monthStart(5);

// agr-4: TechCorp / Chubb — completed, all 6 paid
const agr4Due = monthStart(8);

// ── Agreements ──────────────────────────────────────────────────────
export const mockAgreements: Agreement[] = [
  {
    id: 'agr-1',
    clientId: 'client-1',
    clientName: 'TechCorp Solutions',
    policyholderUserId: 'ph-1',
    premiumAmount: 120000,
    policyPeriodStart: d(agr1Due),
    policyPeriodEnd: d(addMonths(agr1Due, 12)),
    insurerName: 'Allianz Commercial',
    downPaymentPercent: 20,
    instalmentCount: 12,
    status: 'active',
    createdAt: d(subDays(agr1Due, 12)),
    instalments: makeInstalments('1', 'agr-1', 12, 8417.62, agr1Due, 2, 8417.59),
  },
  {
    id: 'agr-2',
    clientId: 'client-2',
    clientName: 'Green Valley Construction',
    premiumAmount: 85000,
    policyPeriodStart: d(subMonths(agr2Due, 1)),
    policyPeriodEnd: d(addMonths(subMonths(agr2Due, 1), 12)),
    insurerName: 'AXA XL',
    downPaymentPercent: 25,
    instalmentCount: 6,
    status: 'active',
    createdAt: d(subDays(subMonths(agr2Due, 1), 5)),
    instalments: makeInstalments('2', 'agr-2', 6, 10921.34, agr2Due, countPast(agr2Due, 6), 10921.31),
  },
  {
    id: 'agr-3',
    clientId: 'client-3',
    clientName: 'Pinnacle Healthcare',
    premiumAmount: 200000,
    policyPeriodStart: d(subMonths(agr3Due, 1)),
    policyPeriodEnd: d(addMonths(subMonths(agr3Due, 1), 12)),
    insurerName: 'Zurich Insurance',
    downPaymentPercent: 15,
    instalmentCount: 12,
    status: 'active',
    createdAt: d(subDays(subMonths(agr3Due, 1), 10)),
    instalments: makeInstalments('3', 'agr-3', 12, 14906.20, agr3Due, countPast(agr3Due, 12), 14906.16),
  },
  {
    id: 'agr-4',
    clientId: 'client-1',
    clientName: 'TechCorp Solutions',
    policyholderUserId: 'ph-1',
    premiumAmount: 45000,
    policyPeriodStart: d(subMonths(agr4Due, 1)),
    policyPeriodEnd: d(addMonths(subMonths(agr4Due, 1), 12)),
    insurerName: 'Chubb',
    downPaymentPercent: 20,
    instalmentCount: 6,
    status: 'completed',
    createdAt: d(subDays(subMonths(agr4Due, 1), 15)),
    instalments: makeInstalments('4', 'agr-4', 6, 6167.34, agr4Due, 6, 6167.35),
  },
  {
    id: 'agr-5',
    clientId: 'client-4',
    clientName: 'Atlas Logistics',
    premiumAmount: 150000,
    policyPeriodStart: d(monthStart(1)),
    policyPeriodEnd: d(addMonths(monthStart(1), 12)),
    insurerName: "Lloyd's of London",
    downPaymentPercent: 20,
    instalmentCount: 12,
    status: 'pending',
    createdAt: d(subDays(monthStart(1), 4)),
    instalments: [],
  },
];

// ── Activity ────────────────────────────────────────────────────────
export const mockActivity: ActivityItem[] = [
  { id: 'act-1', type: 'agreement_created', description: 'New agreement created for Atlas Logistics', timestamp: `${d(subDays(today, 33))}T09:30:00` },
  { id: 'act-2', type: 'payment_received', description: 'Payment received from Green Valley Construction — Instalment #1', timestamp: `${d(subDays(today, 34))}T14:20:00` },
  { id: 'act-3', type: 'payment_received', description: 'Payment received from TechCorp Solutions — Instalment #1', timestamp: `${d(subDays(today, 48))}T11:15:00` },
  { id: 'act-4', type: 'client_added', description: 'New client added: Atlas Logistics', timestamp: `${d(subDays(today, 56))}T16:45:00` },
  { id: 'act-5', type: 'agreement_completed', description: 'Agreement completed for TechCorp Solutions (Chubb policy)', timestamp: `${d(subDays(today, 80))}T10:00:00` },
];
