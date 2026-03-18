import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft, AlertTriangle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgreementStatus, InstalmentStatus } from '@/types';
import { generateAgreementPDF } from '@/lib/pdf-generator';
import { calculateEarlySettlement } from '@/lib/early-settlement';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AgreementDetail() {
  const { id } = useParams();
  const agreement = mockAgreements.find(a => a.id === id);

  if (!agreement) return <div className="text-muted-foreground">Agreement not found.</div>;

  const downPayment = agreement.premiumAmount * (agreement.downPaymentPercent / 100);
  const financed = agreement.premiumAmount - downPayment;
  const paid = agreement.instalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const overdueInstalments = agreement.instalments.filter(i => i.status === 'overdue');
  const settlement = agreement.status === 'active' ? calculateEarlySettlement(agreement) : null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link to="/broker/dashboard"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{agreement.clientName}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => generateAgreementPDF(agreement)}
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </Button>
          <Badge variant="outline" className={statusColors[agreement.status]}>{agreement.status}</Badge>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Agreement Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Insurer</p><p className="font-medium">{agreement.insurerName}</p></div>
            <div><p className="text-xs text-muted-foreground">Premium</p><p className="font-medium">{formatCurrency(agreement.premiumAmount)}</p></div>
            <div><p className="text-xs text-muted-foreground">Down Payment</p><p className="font-medium">{agreement.downPaymentPercent}% ({formatCurrency(downPayment)})</p></div>
            <div><p className="text-xs text-muted-foreground">Financed Amount</p><p className="font-medium">{formatCurrency(financed)}</p></div>
            <div><p className="text-xs text-muted-foreground">Paid So Far</p><p className="font-medium text-success">{formatCurrency(paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Remaining</p><p className="font-medium">{formatCurrency(financed - paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Policy Period</p><p className="font-medium">{agreement.policyPeriodStart} → {agreement.policyPeriodEnd}</p></div>
            <div><p className="text-xs text-muted-foreground">Term</p><p className="font-medium">{agreement.instalmentCount} months</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Only highlight missed instalments — brokers don't need the full schedule */}
      {overdueInstalments.length > 0 && (
        <Card className="glass-card border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Missed Instalments ({overdueInstalments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueInstalments.map(inst => (
                <div key={inst.id} className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                  <div>
                    <p className="text-sm font-medium">Instalment #{inst.number}</p>
                    <p className="text-xs text-muted-foreground">Due: {inst.dueDate}</p>
                  </div>
                  <span className="font-semibold text-destructive">{formatCurrency(inst.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary for broker */}
      <Card className="glass-card">
        <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-success/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-xl font-bold text-success">{agreement.instalments.filter(i => i.status === 'paid').length}</p>
              <p className="text-xs text-muted-foreground">of {agreement.instalments.length} instalments</p>
            </div>
            <div className="rounded-xl bg-accent/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">Upcoming</p>
              <p className="text-xl font-bold text-accent">{agreement.instalments.filter(i => i.status === 'upcoming').length}</p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
            <div className="rounded-xl bg-destructive/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold text-destructive">{overdueInstalments.length}</p>
              <p className="text-xs text-muted-foreground">missed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Early Settlement */}
      {settlement && settlement.remainingInstalments > 0 && (
        <Card className="glass-card border-accent/20 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-base">Early Settlement Quote</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rule of 78 calculation for early payoff. Share this quote with the client.
                  </p>
                </div>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining Balance</p>
                    <p className="text-lg font-bold">{formatCurrency(settlement.remainingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rebate</p>
                    <p className="text-lg font-bold text-success">-{formatCurrency(settlement.interestRebate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Settlement Amount</p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(settlement.settlementAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Client Saves</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(settlement.saving)} ({settlement.savingPercent.toFixed(1)}%)</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Indicative quote only. Final settlement figure subject to confirmation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
