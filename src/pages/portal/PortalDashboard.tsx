import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { FileText, DollarSign, Calendar, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { InstalmentStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalDashboard() {
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

  // Next 3 upcoming payments
  const upcomingPayments = activeAgreements
    .flatMap(a => a.instalments.filter(i => i.status === 'upcoming').map(i => ({ ...i, insurerName: a.insurerName })))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Chart data - payment timeline
  const allInstalments = activeAgreements.flatMap(a => a.instalments);
  const monthlyData = allInstalments.reduce((acc, inst) => {
    const month = inst.dueDate.substring(0, 7);
    const existing = acc.find(d => d.month === month);
    if (existing) {
      if (inst.status === 'paid') existing.paid += inst.amount;
      else existing.remaining += inst.amount;
    } else {
      acc.push({
        month,
        label: format(parseISO(inst.dueDate), 'MMM yy'),
        paid: inst.status === 'paid' ? inst.amount : 0,
        remaining: inst.status !== 'paid' ? inst.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; label: string; paid: number; remaining: number }[])
    .sort((a, b) => a.month.localeCompare(b.month));

  // Donut data
  const paidTotal = allInstalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const upcomingTotal = allInstalments.filter(i => i.status === 'upcoming').reduce((s, i) => s + i.amount, 0);
  const overdueTotal = allInstalments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const donutData = [
    { name: 'Paid', value: paidTotal, color: 'hsl(152, 69%, 41%)' },
    { name: 'Upcoming', value: upcomingTotal, color: 'hsl(174, 76%, 39%)' },
    { name: 'Overdue', value: overdueTotal, color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome + quick stats */}
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

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Payment timeline */}
        <Card className="glass-card md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(152, 69%, 41%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(174, 76%, 39%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(174, 76%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 35%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 35%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(207, 38%, 16%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="paid" stackId="1" stroke="hsl(152, 69%, 41%)" fill="url(#paidGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="remaining" stackId="1" stroke="hsl(174, 76%, 39%)" fill="url(#remainingGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut */}
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

      {/* Upcoming payments - modern card style */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Next Payments</h2>
          <Link to="/portal/payments" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {upcomingPayments.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {upcomingPayments.map((p, idx) => (
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
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(p.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Due</p>
                      <p className="text-sm font-medium">{format(parseISO(p.dueDate), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">No upcoming payments.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
