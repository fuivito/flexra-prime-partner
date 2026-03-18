import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgreements, mockClients, mockActivity } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { Users, FileText, Send, CheckCircle2, DollarSign, Activity, AlertTriangle, PlusCircle, UserPlus, TrendingUp } from 'lucide-react';
import SendReminderButton from '@/components/SendReminderButton';
import { Link, useNavigate } from 'react-router-dom';
import { AgreementStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

// Chart data
const activeAgreements = mockAgreements.filter(a => a.status === 'active').length;
const pendingDeals = mockAgreements.filter(a => a.status === 'pending').length;
const completedDeals = mockAgreements.filter(a => a.status === 'completed').length;
const totalVolume = mockAgreements.reduce((sum, a) => sum + a.premiumAmount, 0);

const statusPieData = [
  { name: 'Active', value: activeAgreements, fill: 'hsl(174, 76%, 39%)' },
  { name: 'Pending', value: pendingDeals, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Completed', value: completedDeals, fill: 'hsl(215, 12%, 35%)' },
];

const monthlyVolumeData = [
  { month: 'Sep', value: 45000 },
  { month: 'Oct', value: 200000 },
  { month: 'Nov', value: 0 },
  { month: 'Dec', value: 120000 },
  { month: 'Jan', value: 85000 },
  { month: 'Feb', value: 150000 },
];

// Cumulative broker commission earnings (mock ~3% of financed volume)
const commissionData = [
  { month: 'Sep', earnings: 1350 },
  { month: 'Oct', earnings: 7350 },
  { month: 'Nov', earnings: 7350 },
  { month: 'Dec', earnings: 10950 },
  { month: 'Jan', earnings: 13500 },
  { month: 'Feb', earnings: 18000 },
];
const totalCommission = commissionData[commissionData.length - 1].earnings;

export default function BrokerDashboard() {
  const navigate = useNavigate();

  const overdueInstalments = mockAgreements.flatMap(a =>
    a.instalments.filter(i => i.status === 'overdue').map(i => ({ ...i, clientName: a.clientName, agreementId: a.id }))
  );

  const stats = [
    { label: 'CLIENTS', value: mockClients.length.toString(), icon: Users, href: '/broker/clients' },
    { label: 'PENDING', value: pendingDeals.toString(), icon: Send, href: '/broker/agreements?status=pending' },
    { label: 'ACTIVE', value: activeAgreements.toString(), icon: CheckCircle2, href: '/broker/agreements?status=active' },
    { label: 'COMPLETED', value: completedDeals.toString(), icon: FileText, href: '/broker/agreements?status=completed' },
    { label: 'FINANCED', value: formatCurrency(totalVolume), icon: DollarSign, href: '/broker/agreements' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with CTAs */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's your overview.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="gap-2 rounded-full px-6 h-11 border-border glass-card hover:bg-muted/60"
            onClick={() => navigate('/broker/clients')}
          >
            <UserPlus className="h-4 w-4" /> Add New Client
          </Button>
          <Button
            className="gap-2 rounded-full px-6 h-11 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate('/broker/deals/new')}
          >
            <PlusCircle className="h-4 w-4" /> Create Agreement
          </Button>
        </div>
      </div>

      {/* Stat Cards — all clickable */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="glass-card rounded-xl p-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <stat.icon className="h-5 w-5 mb-2 text-accent opacity-80 group-hover:opacity-100 transition-opacity" />
            <p className="text-xs font-semibold tracking-wider text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Volume - Area Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Financing Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyVolumeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(174, 76%, 39%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(174, 76%, 39%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 18%, 86%)" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 12%, 35%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 12%, 35%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100% / 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid hsl(200, 18%, 86%)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Volume']}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(174, 76%, 39%)" strokeWidth={2.5} fill="url(#volumeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Status - Donut Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Agreement Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100% / 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid hsl(200, 18%, 86%)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections + Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Broker Commission Earnings */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Commission Earned
            </CardTitle>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCommission)}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[170px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commissionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 18%, 86%)" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215, 12%, 35%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 12%, 35%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100% / 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid hsl(200, 18%, 86%)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Cumulative Earnings']}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} fill="url(#commissionGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Agreements */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Agreements</CardTitle>
            <Link to="/broker/agreements" className="text-sm text-accent hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockAgreements.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  to={`/broker/agreements/${a.id}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.clientName}</p>
                    <p className="text-xs text-muted-foreground">{a.insurerName}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold">{formatCurrency(a.premiumAmount)}</p>
                    <Badge variant="outline" className={`text-xs ${statusColors[a.status]}`}>
                      {a.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert — just above Activity */}
      {overdueInstalments.length > 0 && (
        <Card className="glass-card border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="h-4 w-4" /> Missed Instalments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueInstalments.map((inst) => (
                <div key={inst.id} className="flex items-center gap-2 rounded-lg p-3 hover:bg-destructive/10 transition-colors">
                  <Link
                    to={`/broker/agreements/${inst.agreementId}`}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{inst.clientName}</p>
                      <p className="text-xs text-muted-foreground">Instalment #{inst.number} — Due {inst.dueDate}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">{formatCurrency(inst.amount)}</span>
                  </Link>
                  <SendReminderButton
                    clientName={inst.clientName}
                    instalmentNumber={inst.number}
                    amount={formatCurrency(inst.amount)}
                    compact
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {mockActivity.map((item) => (
              <div key={item.id} className="rounded-lg border border-border/40 p-3 glass-card">
                <p className="text-sm text-foreground">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
