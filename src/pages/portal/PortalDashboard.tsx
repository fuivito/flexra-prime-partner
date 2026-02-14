import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { FileText, DollarSign, Calendar, TrendingUp, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { Instalment, InstalmentStatus } from '@/types';
import PayNowDialog from '@/components/PayNowDialog';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalDashboard() {
  const [payDialogInst, setPayDialogInst] = useState<Instalment | null>(null);
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

  const overdueCount = activeAgreements.reduce((sum, a) =>
    sum + a.instalments.filter(i => i.status === 'overdue').length, 0);

  // Next 3 payments: overdue first, then upcoming
  const upcomingPayments = activeAgreements
    .flatMap(a => a.instalments.filter(i => i.status === 'upcoming' || i.status === 'overdue').map(i => ({ ...i, insurerName: a.insurerName })))
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 3);

  const allInstalments = activeAgreements.flatMap(a => a.instalments);

  // Donut data
  const paidTotal = allInstalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const upcomingTotal = allInstalments.filter(i => i.status === 'upcoming').reduce((s, i) => s + i.amount, 0);
  const overdueTotal = allInstalments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const donutData = [
    { name: 'Paid', value: paidTotal, color: 'hsl(152, 69%, 41%)' },
    { name: 'Upcoming', value: upcomingTotal, color: 'hsl(174, 76%, 39%)' },
    { name: 'Overdue', value: overdueTotal, color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0);

  // Per-agreement comparison bar chart
  const agreementBars = activeAgreements.map(a => {
    const paid = a.instalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const outstanding = a.instalments.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
    return {
      name: a.insurerName.length > 12 ? a.insurerName.substring(0, 12) + '…' : a.insurerName,
      paid,
      outstanding,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your financing overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link to="/portal/payments">
          <Card className="glass-card hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Agreements</p>
                  <p className="text-3xl font-bold mt-1">{activeAgreements.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Financed</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalFinanced)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(remaining)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {overdueCount > 0 ? (
          <Link to="/portal/payments">
            <Card className="glass-card border-destructive/30 hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-destructive uppercase tracking-wider">Overdue</p>
                    <p className="text-3xl font-bold mt-1 text-destructive">{overdueCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold mt-1 text-success">All on track</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts row: Agreement comparison + Donut */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="glass-card md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Paid vs Outstanding by Policy</CardTitle>
          </CardHeader>
          <CardContent>
            {agreementBars.length === 1 ? (
              /* Single-policy: horizontal progress bars instead of a lonely bar chart */
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium">{activeAgreements[0]?.insurerName}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Paid</span>
                      <span>{formatCurrency(agreementBars[0].paid)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(agreementBars[0].paid / (agreementBars[0].paid + agreementBars[0].outstanding)) * 100}%`,
                          background: 'hsl(152, 69%, 41%)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Outstanding</span>
                      <span>{formatCurrency(agreementBars[0].outstanding)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(agreementBars[0].outstanding / (agreementBars[0].paid + agreementBars[0].outstanding)) * 100}%`,
                          background: 'hsl(174, 76%, 39%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agreementBars} barGap={4}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 35%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 35%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(207, 38%, 16%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="paid" stackId="a" fill="hsl(152, 69%, 41%)" radius={[0, 0, 0, 0]} name="Paid" maxBarSize={80} />
                    <Bar dataKey="outstanding" stackId="a" fill="hsl(174, 76%, 39%)" radius={[4, 4, 0, 0]} name="Outstanding" maxBarSize={80} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {donutData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(207, 38%, 16%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold">{Math.round(progressPercent)}%</p>
                  <p className="text-xs text-muted-foreground">paid</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{formatCurrency(totalPaid)} of {formatCurrency(totalFinanced)}</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{Math.round(progressPercent)}% complete</p>
        </CardContent>
      </Card>

      {/* Upcoming payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Next Payments</h2>
          <Link to="/portal/payments" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {upcomingPayments.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {upcomingPayments.map((p) => (
              <Card key={p.id} className="glass-card hover:shadow-lg transition-all group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Instalment #{p.number}</p>
                      <p className="font-semibold text-sm mt-1">{p.insurerName}</p>
                    </div>
                    <Badge variant="outline" className={instStatusColors[p.status]}>{p.status}</Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-2xl font-bold">{formatCurrency(p.amount)}</p>
                    {p.status === 'overdue' ? (
                      <Button
                        size="sm"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => { e.preventDefault(); setPayDialogInst(p); }}
                      >
                        Pay Now
                      </Button>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Due</p>
                        <p className="text-sm font-medium">{format(parseISO(p.dueDate), 'dd MMM yyyy')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">No upcoming payments.</CardContent></Card>
        )}
      </div>

      {payDialogInst && (
        <PayNowDialog
          open={!!payDialogInst}
          onOpenChange={(open) => { if (!open) setPayDialogInst(null); }}
          amount={payDialogInst.amount}
          instalmentNumber={payDialogInst.number}
          dueDate={format(parseISO(payDialogInst.dueDate), 'dd MMM yyyy')}
        />
      )}
    </div>
  );
}
