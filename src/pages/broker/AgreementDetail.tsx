import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft, AlertTriangle, FileDown } from 'lucide-react';
import SendReminderButton from '@/components/SendReminderButton';
import { Button } from '@/components/ui/button';
import { AgreementStatus } from '@/types';
import { generateAgreementPDF } from '@/lib/pdf-generator';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AgreementDetail() {
  const { id } = useParams();
  const { t, currencyLocale, currency, dateFnsLocale } = useLocale();
  const { agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const agreement = agreements.find(a => a.id === id);

  if (!agreement) return <div className="text-muted-foreground">{t.broker.agreementDetail.agreementNotFound}</div>;

  const downPayment = agreement.premiumAmount * (agreement.downPaymentPercent / 100);
  const financed = agreement.premiumAmount - downPayment;
  const paid = agreement.instalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const overdueInstalments = agreement.instalments.filter(i => i.status === 'overdue');

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link to="/broker/dashboard"><ArrowLeft className="h-4 w-4" /> {t.common.back}</Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{agreement.clientName}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => generateAgreementPDF(agreement, { t, dateFnsLocale, currencyLocale, currency })}
          >
            <FileDown className="h-4 w-4" /> {t.broker.agreementDetail.downloadPdf}
          </Button>
          <Badge variant="outline" className={statusColors[agreement.status]}>{agreement.status}</Badge>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>{t.broker.agreementDetail.agreementDetails}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.insurer}</p><p className="font-medium">{agreement.insurerName}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.premium}</p><p className="font-medium">{fmt(agreement.premiumAmount)}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.downPayment}</p><p className="font-medium">{agreement.downPaymentPercent}% ({fmt(downPayment)})</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.financedAmount}</p><p className="font-medium">{fmt(financed)}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.paidSoFar}</p><p className="font-medium text-success">{fmt(paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.remainingLabel}</p><p className="font-medium">{fmt(financed - paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.policyPeriod}</p><p className="font-medium">{agreement.policyPeriodStart} → {agreement.policyPeriodEnd}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.broker.agreementDetail.term}</p><p className="font-medium">{t.broker.agreementDetail.termMonths(agreement.instalmentCount)}</p></div>
          </div>
        </CardContent>
      </Card>

      {overdueInstalments.length > 0 && (
        <Card className="glass-card border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> {t.broker.agreementDetail.missedInstalments(overdueInstalments.length)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueInstalments.map(inst => (
                <div key={inst.id} className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{t.broker.agreementDetail.instalmentNumber(inst.number)}</p>
                    <p className="text-xs text-muted-foreground">{t.broker.agreementDetail.due} {inst.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-destructive">{fmt(inst.amount)}</span>
                    <SendReminderButton
                      clientName={agreement.clientName}
                      instalmentNumber={inst.number}
                      amount={fmt(inst.amount)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader><CardTitle>{t.broker.agreementDetail.paymentSummary}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-success/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">{t.broker.agreementDetail.paidLabel}</p>
              <p className="text-xl font-bold text-success">{agreement.instalments.filter(i => i.status === 'paid').length}</p>
              <p className="text-xs text-muted-foreground">{t.broker.agreementDetail.ofInstalments(agreement.instalments.length)}</p>
            </div>
            <div className="rounded-xl bg-accent/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">{t.broker.agreementDetail.upcomingLabel}</p>
              <p className="text-xl font-bold text-accent">{agreement.instalments.filter(i => i.status === 'upcoming').length}</p>
              <p className="text-xs text-muted-foreground">{t.common.remaining}</p>
            </div>
            <div className="rounded-xl bg-destructive/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">{t.broker.agreementDetail.overdueLabel}</p>
              <p className="text-xl font-bold text-destructive">{overdueInstalments.length}</p>
              <p className="text-xs text-muted-foreground">{t.common.missed}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
