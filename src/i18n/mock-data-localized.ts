import { useLocale } from './LocaleContext';
import { Client, Agreement, ActivityItem, User } from '@/types';

// Italian mock data variants
const itBrokerUser: User = {
  id: 'broker-1',
  name: 'Sara Marchetti',
  email: 'sara@flexra.it',
  role: 'broker',
  company: 'Flexra Servizi Assicurativi',
};

const itPolicyholderUser: User = {
  id: 'ph-1',
  name: 'Marco Bianchi',
  email: 'marco@techcorp.it',
  role: 'policyholder',
  company: 'TechCorp Soluzioni',
  phone: '+39 02 1234 5678',
};

const itClients: Client[] = [
  {
    id: 'client-1',
    companyName: 'TechCorp Soluzioni',
    contactPerson: 'Marco Bianchi',
    email: 'marco@techcorp.it',
    phone: '+39 02 1234 5678',
    businessType: 'Tecnologia',
    companyRegNumber: '08745231',
    createdAt: '2025-11-15',
  },
  {
    id: 'client-2',
    companyName: 'Valle Verde Costruzioni',
    contactPerson: 'Maria Rossi',
    email: 'maria@valleverde.it',
    phone: '+39 06 2345 6789',
    businessType: 'Edilizia',
    companyRegNumber: '11294076',
    createdAt: '2025-12-01',
  },
  {
    id: 'client-3',
    companyName: 'Pinnacle Sanità',
    contactPerson: 'Dott. Roberto Kim',
    email: 'rkim@pinnacle.it',
    phone: '+39 02 3456 7890',
    businessType: 'Sanità',
    companyRegNumber: '06381952',
    createdAt: '2026-01-10',
  },
  {
    id: 'client-4',
    companyName: 'Atlas Logistica',
    contactPerson: 'Nina Patel',
    email: 'nina@atlaslogistica.it',
    phone: '+39 06 4567 8901',
    businessType: 'Logistica',
    createdAt: '2026-01-22',
  },
];

const itAgreements: Agreement[] = [
  {
    id: 'agr-1',
    clientId: 'client-1',
    clientName: 'TechCorp Soluzioni',
    policyholderUserId: 'ph-1',
    premiumAmount: 120000,
    policyPeriodStart: '2026-01-01',
    policyPeriodEnd: '2027-01-01',
    insurerName: 'Allianz Commercial',
    downPaymentPercent: 20,
    instalmentCount: 12,
    status: 'active',
    createdAt: '2025-12-20',
    instalments: [
      { id: 'i-1-1', agreementId: 'agr-1', number: 1, amount: 8000, dueDate: '2026-01-01', status: 'paid', paidDate: '2026-01-02' },
      { id: 'i-1-2', agreementId: 'agr-1', number: 2, amount: 8000, dueDate: '2026-02-01', status: 'overdue' },
      { id: 'i-1-3', agreementId: 'agr-1', number: 3, amount: 8000, dueDate: '2026-03-01', status: 'upcoming' },
      { id: 'i-1-4', agreementId: 'agr-1', number: 4, amount: 8000, dueDate: '2026-05-01', status: 'upcoming' },
      { id: 'i-1-5', agreementId: 'agr-1', number: 5, amount: 8000, dueDate: '2026-06-01', status: 'upcoming' },
      { id: 'i-1-6', agreementId: 'agr-1', number: 6, amount: 8000, dueDate: '2026-07-01', status: 'upcoming' },
      { id: 'i-1-7', agreementId: 'agr-1', number: 7, amount: 8000, dueDate: '2026-08-01', status: 'upcoming' },
      { id: 'i-1-8', agreementId: 'agr-1', number: 8, amount: 8000, dueDate: '2026-09-01', status: 'upcoming' },
      { id: 'i-1-9', agreementId: 'agr-1', number: 9, amount: 8000, dueDate: '2026-10-01', status: 'upcoming' },
      { id: 'i-1-10', agreementId: 'agr-1', number: 10, amount: 8000, dueDate: '2026-11-01', status: 'upcoming' },
      { id: 'i-1-11', agreementId: 'agr-1', number: 11, amount: 8000, dueDate: '2026-12-01', status: 'upcoming' },
      { id: 'i-1-12', agreementId: 'agr-1', number: 12, amount: 8000, dueDate: '2027-01-01', status: 'upcoming' },
    ],
  },
  {
    id: 'agr-2',
    clientId: 'client-2',
    clientName: 'Valle Verde Costruzioni',
    premiumAmount: 85000,
    policyPeriodStart: '2026-01-15',
    policyPeriodEnd: '2027-01-15',
    insurerName: 'AXA XL',
    downPaymentPercent: 25,
    instalmentCount: 6,
    status: 'active',
    createdAt: '2026-01-10',
    instalments: [
      { id: 'i-2-1', agreementId: 'agr-2', number: 1, amount: 10625, dueDate: '2026-02-15', status: 'paid', paidDate: '2026-02-13' },
      { id: 'i-2-2', agreementId: 'agr-2', number: 2, amount: 10625, dueDate: '2026-03-15', status: 'upcoming' },
      { id: 'i-2-3', agreementId: 'agr-2', number: 3, amount: 10625, dueDate: '2026-04-15', status: 'upcoming' },
      { id: 'i-2-4', agreementId: 'agr-2', number: 4, amount: 10625, dueDate: '2026-05-15', status: 'upcoming' },
      { id: 'i-2-5', agreementId: 'agr-2', number: 5, amount: 10625, dueDate: '2026-06-15', status: 'upcoming' },
      { id: 'i-2-6', agreementId: 'agr-2', number: 6, amount: 10625, dueDate: '2026-07-15', status: 'upcoming' },
    ],
  },
  {
    id: 'agr-3',
    clientId: 'client-3',
    clientName: 'Pinnacle Sanità',
    premiumAmount: 200000,
    policyPeriodStart: '2025-10-01',
    policyPeriodEnd: '2026-10-01',
    insurerName: 'Zurich Insurance',
    downPaymentPercent: 15,
    instalmentCount: 12,
    status: 'active',
    createdAt: '2025-09-20',
    instalments: [
      { id: 'i-3-1', agreementId: 'agr-3', number: 1, amount: 14167, dueDate: '2025-11-01', status: 'paid', paidDate: '2025-10-30' },
      { id: 'i-3-2', agreementId: 'agr-3', number: 2, amount: 14167, dueDate: '2025-12-01', status: 'paid', paidDate: '2025-11-29' },
      { id: 'i-3-3', agreementId: 'agr-3', number: 3, amount: 14167, dueDate: '2026-01-01', status: 'paid', paidDate: '2025-12-30' },
      { id: 'i-3-4', agreementId: 'agr-3', number: 4, amount: 14167, dueDate: '2026-02-01', status: 'paid', paidDate: '2026-01-30' },
      { id: 'i-3-5', agreementId: 'agr-3', number: 5, amount: 14167, dueDate: '2026-03-01', status: 'upcoming' },
      { id: 'i-3-6', agreementId: 'agr-3', number: 6, amount: 14167, dueDate: '2026-04-01', status: 'upcoming' },
      { id: 'i-3-7', agreementId: 'agr-3', number: 7, amount: 14167, dueDate: '2026-05-01', status: 'upcoming' },
      { id: 'i-3-8', agreementId: 'agr-3', number: 8, amount: 14167, dueDate: '2026-06-01', status: 'upcoming' },
      { id: 'i-3-9', agreementId: 'agr-3', number: 9, amount: 14167, dueDate: '2026-07-01', status: 'upcoming' },
      { id: 'i-3-10', agreementId: 'agr-3', number: 10, amount: 14167, dueDate: '2026-08-01', status: 'upcoming' },
      { id: 'i-3-11', agreementId: 'agr-3', number: 11, amount: 14167, dueDate: '2026-09-01', status: 'upcoming' },
      { id: 'i-3-12', agreementId: 'agr-3', number: 12, amount: 14163, dueDate: '2026-10-01', status: 'upcoming' },
    ],
  },
  {
    id: 'agr-4',
    clientId: 'client-1',
    clientName: 'TechCorp Soluzioni',
    policyholderUserId: 'ph-1',
    premiumAmount: 45000,
    policyPeriodStart: '2025-07-01',
    policyPeriodEnd: '2026-07-01',
    insurerName: 'Chubb',
    downPaymentPercent: 20,
    instalmentCount: 6,
    status: 'completed',
    createdAt: '2025-06-15',
    instalments: [
      { id: 'i-4-1', agreementId: 'agr-4', number: 1, amount: 6000, dueDate: '2025-08-01', status: 'paid', paidDate: '2025-07-30' },
      { id: 'i-4-2', agreementId: 'agr-4', number: 2, amount: 6000, dueDate: '2025-09-01', status: 'paid', paidDate: '2025-08-30' },
      { id: 'i-4-3', agreementId: 'agr-4', number: 3, amount: 6000, dueDate: '2025-10-01', status: 'paid', paidDate: '2025-09-29' },
      { id: 'i-4-4', agreementId: 'agr-4', number: 4, amount: 6000, dueDate: '2025-11-01', status: 'paid', paidDate: '2025-10-30' },
      { id: 'i-4-5', agreementId: 'agr-4', number: 5, amount: 6000, dueDate: '2025-12-01', status: 'paid', paidDate: '2025-11-29' },
      { id: 'i-4-6', agreementId: 'agr-4', number: 6, amount: 6000, dueDate: '2026-01-01', status: 'paid', paidDate: '2025-12-30' },
    ],
  },
  {
    id: 'agr-5',
    clientId: 'client-4',
    clientName: 'Atlas Logistica',
    premiumAmount: 150000,
    policyPeriodStart: '2026-02-01',
    policyPeriodEnd: '2027-02-01',
    insurerName: 'Lloyd\'s of London',
    downPaymentPercent: 20,
    instalmentCount: 12,
    status: 'pending',
    createdAt: '2026-01-28',
    instalments: [],
  },
];

const itActivity: ActivityItem[] = [
  { id: 'act-1', type: 'agreement_created', description: 'Nuovo accordo creato per Atlas Logistica', timestamp: '2026-02-14T09:30:00' },
  { id: 'act-2', type: 'payment_received', description: 'Pagamento ricevuto da Valle Verde Costruzioni — Rata #1', timestamp: '2026-02-13T14:20:00' },
  { id: 'act-3', type: 'payment_received', description: 'Pagamento ricevuto da TechCorp Soluzioni — Rata #1', timestamp: '2026-01-30T11:15:00' },
  { id: 'act-4', type: 'client_added', description: 'Nuovo cliente aggiunto: Atlas Logistica', timestamp: '2026-01-22T16:45:00' },
  { id: 'act-5', type: 'agreement_completed', description: 'Accordo completato per TechCorp Soluzioni (polizza Chubb)', timestamp: '2025-12-30T10:00:00' },
];

// Import English data
import {
  mockBrokerUser as enBrokerUser,
  mockPolicyholderUser as enPolicyholderUser,
  mockClients as enClients,
  mockAgreements as enAgreements,
  mockActivity as enActivity,
} from '@/data/mock-data';

export function useLocalizedMockData() {
  const { locale } = useLocale();

  if (locale === 'it') {
    return {
      brokerUser: itBrokerUser,
      policyholderUser: itPolicyholderUser,
      clients: itClients,
      agreements: itAgreements,
      activity: itActivity,
    };
  }

  return {
    brokerUser: enBrokerUser,
    policyholderUser: enPolicyholderUser,
    clients: enClients,
    agreements: enAgreements,
    activity: enActivity,
  };
}
