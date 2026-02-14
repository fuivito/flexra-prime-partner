import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft } from 'lucide-react';
import { AgreementStatus, InstalmentStatus } from '@/types';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AgreementDetail() {
  const { id } = useParams();
  const agreement = mockAgreements.find(a => a.id === id);

  if (!agreement) return <div className="text-muted-foreground">Agreement not found.</div>;

  const downPayment = agreement.premiumAmount * (agreement.downPaymentPercent / 100);
  const financed = agreement.premiumAmount - downPayment;
  const paid = agreement.instalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link to="/broker/dashboard"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{agreement.clientName}</h1>
        <Badge variant="outline" className={statusColors[agreement.status]}>{agreement.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Agreement Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Insurer</p><p className="font-medium">{agreement.insurerName}</p></div>
            <div><p className="text-xs text-muted-foreground">Premium</p><p className="font-medium">{formatCurrency(agreement.premiumAmount)}</p></div>
            <div><p className="text-xs text-muted-foreground">Down Payment</p><p className="font-medium">{agreement.downPaymentPercent}% ({formatCurrency(downPayment)})</p></div>
            <div><p className="text-xs text-muted-foreground">Financed Amount</p><p className="font-medium">{formatCurrency(financed)}</p></div>
            <div><p className="text-xs text-muted-foreground">Paid So Far</p><p className="font-medium">{formatCurrency(paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Remaining</p><p className="font-medium">{formatCurrency(financed - paid)}</p></div>
            <div><p className="text-xs text-muted-foreground">Policy Period</p><p className="font-medium">{agreement.policyPeriodStart} → {agreement.policyPeriodEnd}</p></div>
            <div><p className="text-xs text-muted-foreground">Term</p><p className="font-medium">{agreement.instalmentCount} months</p></div>
          </div>
        </CardContent>
      </Card>

      {agreement.instalments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Instalment Schedule</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreement.instalments.map(inst => (
                  <TableRow key={inst.id}>
                    <TableCell>{inst.number}</TableCell>
                    <TableCell>{inst.dueDate}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(inst.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={instStatusColors[inst.status]}>{inst.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
