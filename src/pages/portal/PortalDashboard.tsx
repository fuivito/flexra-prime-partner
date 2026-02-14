import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { InstalmentStatus } from '@/types';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalDashboard() {
  // Filter agreements for the logged-in policyholder
  const myAgreements = mockAgreements.filter(a => a.policyholderUserId === 'ph-1');
  const activeAgreements = myAgreements.filter(a => a.status === 'active');

  const totalFinanced = activeAgreements.reduce((sum, a) => {
    const dp = a.premiumAmount * (a.downPaymentPercent / 100);
    return sum + (a.premiumAmount - dp);
  }, 0);

  const totalPaid = activeAgreements.reduce((sum, a) =>
    sum + a.instalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 0);

  const remaining = totalFinanced - totalPaid;
  const progressPercent = totalFinanced > 0 ? (totalPaid / totalFinanced) * 100 : 0;

  // Next 3 upcoming payments across all active agreements
  const upcomingPayments = activeAgreements
    .flatMap(a => a.instalments.filter(i => i.status === 'upcoming').map(i => ({ ...i, clientName: a.clientName, insurerName: a.insurerName })))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAgreements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Financed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalFinanced)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(remaining)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid: {formatCurrency(totalPaid)}</span>
              <span className="text-muted-foreground">Remaining: {formatCurrency(remaining)}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">{Math.round(progressPercent)}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.insurerName}</TableCell>
                    <TableCell>{p.dueDate}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className={instStatusColors[p.status]}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming payments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
