import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft, AlertTriangle, FileDown } from 'lucide-react';
import SendReminderButton from '@/components/SendReminderButton';
import { Button } from '@/components/ui/button';
import { AgreementStatus, InstalmentStatus } from '@/types';
import { generateAgreementPDF } from '@/lib/pdf-generator';


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

    </div>
  );
}
