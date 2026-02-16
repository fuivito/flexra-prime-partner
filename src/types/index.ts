export type UserRole = 'broker' | 'policyholder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  companyRegNumber?: string;
  createdAt: string;
}

export type AgreementStatus = 'active' | 'pending' | 'completed' | 'overdue';

export interface Agreement {
  id: string;
  clientId: string;
  clientName: string;
  policyholderUserId?: string;
  premiumAmount: number;
  policyPeriodStart: string;
  policyPeriodEnd: string;
  insurerName: string;
  downPaymentPercent: number;
  instalmentCount: number;
  status: AgreementStatus;
  createdAt: string;
  instalments: Instalment[];
}

export type InstalmentStatus = 'paid' | 'upcoming' | 'overdue';

export interface Instalment {
  id: string;
  agreementId: string;
  number: number;
  amount: number;
  dueDate: string;
  status: InstalmentStatus;
  paidDate?: string;
}

export interface ActivityItem {
  id: string;
  type: 'agreement_created' | 'payment_received' | 'client_added' | 'agreement_completed';
  description: string;
  timestamp: string;
}
