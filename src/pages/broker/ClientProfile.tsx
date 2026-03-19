import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgreementStatus } from '@/types';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, currencyLocale, currency } = useLocale();
  const { clients, agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const client = clients.find(c => c.id === id);
  const clientAgreements = agreements.filter(a => a.clientId === id);

  if (!client) return <div className="text-muted-foreground">{t.broker.clientProfile.clientNotFound}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/broker/clients"><ArrowLeft className="h-4 w-4" /> {t.broker.clientProfile.backToClients}</Link>
        </Button>
        <Button onClick={() => navigate('/broker/deals/new')} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5">
          <PlusCircle className="h-4 w-4" /> {t.broker.clientProfile.createAgreement}
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{client.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">{t.broker.clientProfile.contactPerson}</p><p className="font-medium">{client.contactPerson}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.clientProfile.email}</p><p className="font-medium">{client.email}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.clientProfile.phone}</p><p className="font-medium">{client.phone}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.clientProfile.businessType}</p><p className="font-medium">{client.businessType}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.clientProfile.added}</p><p className="font-medium">{client.createdAt}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.broker.clientProfile.agreementsCount(clientAgreements.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {clientAgreements.length > 0 ? (
            <div className="space-y-1">
              {clientAgreements.map(a => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/broker/agreements/${a.id}`)}
                  className="flex items-center justify-between rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{a.insurerName}</p>
                    <p className="text-sm text-muted-foreground">{a.instalmentCount}mo · {a.policyPeriodStart} → {a.policyPeriodEnd}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{fmt(a.premiumAmount)}</span>
                    <Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.broker.clientProfile.noAgreements}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
