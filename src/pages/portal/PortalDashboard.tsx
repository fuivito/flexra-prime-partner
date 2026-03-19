import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculator';
import { FileText, DollarSign, Calendar, TrendingUp, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { Instalment, InstalmentStatus } from '@/types';
import PayNowDialog from '@/components/PayNowDialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalDashboard() {
  const [payDialogInst, setPayDialogInst] = useState<Instalment | null>(null);
  const { t, currencyLocale, currency, dateFnsLocale } = useLocale();
  const { agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const myAgreements = agreements.filter(a => a.policyholderUserId === 'ph-1');
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

  const upcomingPayments = activeAgreements
    .flatMap(a => a.instalments.filter(i => i.status === 'upcoming' || i.status === 'overdue').map(i => ({ ...i, insurerName: a.insurerName })))
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 3);

  const allInstalments = activeAgreements.flatMap(a => a.instalments);

  const paidTotal = allInstalments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const upcomingTotal = allInstalments.filter(i => i.status === 'upcoming').reduce((s, i) => s + i.amount, 0);
  const overdueTotal = allInstalments.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const donutData = [
    { name: t.common.paid, value: paidTotal, color: 'hsl(152, 69%, 41%)' },
    { name: t.common.upcoming, value: upcomingTotal, color: 'hsl(174, 76%, 39%)' },
    { name: t.common.overdue, value: overdueTotal, color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.portal.dashboard.welcomeBack}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.portal.dashboard.subtitle}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Link to="/portal/payments">
          <Card className="glass-card hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.dashboard.activeAgreements}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{activeAgreements.length}</p>
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.dashboard.totalFinanced}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{fmt(totalFinanced)}</p>
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.dashboard.remainingLabel}</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{fmt(remaining)}</p>
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
                    <p className="text-xs text-destructive uppercase tracking-wider">{t.portal.dashboard.overdueLabel}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 text-destructive">{overdueCount}</p>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.dashboard.statusLabel}</p>
                  <p className="text-lg font-bold mt-1 text-success">{t.portal.dashboard.allOnTrack}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Breakdown Donut */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.portal.dashboard.paymentBreakdown}</CardTitle>
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
                  formatter={(value: number) => fmt(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-bold">{Math.round(progressPercent)}%</p>
                <p className="text-xs text-muted-foreground">{t.portal.dashboard.paidLabel}</p>
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

      {/* Progress bar */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t.portal.dashboard.overallProgress}</span>
            <span className="text-sm text-muted-foreground">{t.portal.dashboard.ofTotal(fmt(totalPaid), fmt(totalFinanced))}</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{Math.round(progressPercent)}% {t.portal.dashboard.complete}</p>
        </CardContent>
      </Card>

      {/* Upcoming payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t.portal.dashboard.nextPayments}</h2>
          <Link to="/portal/payments" className="text-sm text-accent hover:underline flex items-center gap-1">
            {t.portal.dashboard.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {upcomingPayments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {upcomingPayments.map((p) => (
              <Card key={p.id} className="glass-card hover:shadow-lg transition-all group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.dashboard.instalmentNumber(p.number)}</p>
                      <p className="font-semibold text-sm mt-1">{p.insurerName}</p>
                    </div>
                    <Badge variant="outline" className={instStatusColors[p.status]}>{p.status}</Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-2xl font-bold">{fmt(p.amount)}</p>
                    {p.status === 'overdue' ? (
                      <Button
                        size="sm"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => { e.preventDefault(); setPayDialogInst(p); }}
                      >
                        {t.portal.dashboard.payNow}
                      </Button>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t.portal.dashboard.due}</p>
                        <p className="text-sm font-medium">{format(parseISO(p.dueDate), 'dd MMM yyyy', { locale: dateFnsLocale })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">{t.portal.dashboard.noUpcoming}</CardContent></Card>
        )}
      </div>

      {payDialogInst && (
        <PayNowDialog
          open={!!payDialogInst}
          onOpenChange={(open) => { if (!open) setPayDialogInst(null); }}
          amount={payDialogInst.amount}
          instalmentNumber={payDialogInst.number}
          dueDate={format(parseISO(payDialogInst.dueDate), 'dd MMM yyyy', { locale: dateFnsLocale })}
        />
      )}
    </div>
  );
}
