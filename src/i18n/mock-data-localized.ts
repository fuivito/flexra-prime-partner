import { useLocale } from './LocaleContext';
import { Client, Agreement, ActivityItem, User } from '@/types';
import {
  mockBrokerUser as enBrokerUser,
  mockPolicyholderUser as enPolicyholderUser,
  mockClients as enClients,
  mockAgreements as enAgreements,
  mockActivity as enActivity,
} from '@/data/mock-data';

// ── Italian users ───────────────────────────────────────────────────
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

// ── Italian clients (dates inherited from EN) ───────────────────────
const itClients: Client[] = [
  {
    ...enClients[0],
    companyName: 'TechCorp Soluzioni',
    contactPerson: 'Marco Bianchi',
    email: 'marco@techcorp.it',
    phone: '+39 02 1234 5678',
    businessType: 'Tecnologia',
  },
  {
    ...enClients[1],
    companyName: 'Valle Verde Costruzioni',
    contactPerson: 'Maria Rossi',
    email: 'maria@valleverde.it',
    phone: '+39 06 2345 6789',
    businessType: 'Edilizia',
  },
  {
    ...enClients[2],
    companyName: 'Pinnacle Sanità',
    contactPerson: 'Dott. Roberto Kim',
    email: 'rkim@pinnacle.it',
    phone: '+39 02 3456 7890',
    businessType: 'Sanità',
  },
  {
    ...enClients[3],
    companyName: 'Atlas Logistica',
    contactPerson: 'Nina Patel',
    email: 'nina@atlaslogistica.it',
    phone: '+39 06 4567 8901',
    businessType: 'Logistica',
  },
];

// ── Italian agreements (dates + instalments inherited from EN) ──────
const itAgreements: Agreement[] = [
  { ...enAgreements[0], clientName: 'TechCorp Soluzioni' },
  { ...enAgreements[1], clientName: 'Valle Verde Costruzioni' },
  { ...enAgreements[2], clientName: 'Pinnacle Sanità' },
  { ...enAgreements[3], clientName: 'TechCorp Soluzioni' },
  { ...enAgreements[4], clientName: 'Atlas Logistica' },
];

// ── Italian activity (timestamps inherited from EN) ─────────────────
const itActivity: ActivityItem[] = [
  { ...enActivity[0], description: 'Nuovo contratto creato per Atlas Logistica' },
  { ...enActivity[1], description: 'Pagamento ricevuto da Valle Verde Costruzioni — Rata #1' },
  { ...enActivity[2], description: 'Pagamento ricevuto da TechCorp Soluzioni — Rata #1' },
  { ...enActivity[3], description: 'Nuovo cliente aggiunto: Atlas Logistica' },
  { ...enActivity[4], description: 'Contratto completato per TechCorp Soluzioni (polizza Chubb)' },
];

// ── Hook ────────────────────────────────────────────────────────────
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
