import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgreements, mockClients, mockActivity } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useState } from 'react';
import { Users, FileText, Send, CheckCircle2, PenLine, DollarSign, Activity, AlertTriangle, PlusCircle, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AgreementStatus } from '@/types';
import { Button } from '@/components/ui/button';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusCardColors: Record<string, string> = {
  clients: 'from-accent/5 to-accent/10 text-accent',
  drafts: 'from-muted/40 to-muted/60 text-muted-foreground',
  pending: 'from-warning/5 to-warning/10 text-warning',
  active: 'from-success/5 to-success/10 text-success',
  completed: 'from-primary/5 to-primary/10 text-primary',
  financed: 'from-accent/5 to-accent/10 text-accent',
};

export default function BrokerDashboard() {
  const navigate = useNavigate();
  const activeAgreements = mockAgreements.filter(a => a.status === 'active').length;
  const pendingDeals = mockAgreements.filter(a => a.status === 'pending').length;
  const completedDeals = mockAgreements.filter(a => a.status === 'completed').length;
  const totalVolume = mockAgreements.reduce((sum, a) => sum + a.premiumAmount, 0);

  // Check for missed instalments across all agreements
  const overdueInstalments = mockAgreements.flatMap(a =>
    a.instalments.filter(i => i.status === 'overdue').map(i => ({ ...i, clientName: a.clientName, agreementId: a.id }))
  );

  const stats = [
    { label: 'CLIENTS', value: mockClients.length.toString(), icon: Users, color: statusCardColors.clients },
    { label: 'PENDING', value: pendingDeals.toString(), icon: Send, color: statusCardColors.pending },
    { label: 'ACTIVE', value: activeAgreements.toString(), icon: CheckCircle2, color: statusCardColors.active },
    { label: 'COMPLETED', value: completedDeals.toString(), icon: PenLine, color: statusCardColors.completed },
    { label: 'FINANCED', value: formatCurrency(totalVolume), icon: DollarSign, color: statusCardColors.financed },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with CTAs */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's your overview.</p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            className="gap-2 rounded-full px-6 h-11 border-border bg-card hover:bg-muted"
            onClick={() => navigate('/broker/clients')}
          >
            <UserPlus className="h-4 w-4" /> Add New Client
          </Button>
          <Button
            className="gap-2 rounded-full px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/broker/deals/new')}
          >
            <PlusCircle className="h-4 w-4" /> Create Agreement
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-card rounded-xl p-5 bg-gradient-to-br ${stat.color}`}>
            <stat.icon className="h-5 w-5 mb-2 opacity-70" />
            <p className="text-xs font-semibold tracking-wider opacity-70">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
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
                <Link
                  key={inst.id}
                  to={`/broker/agreements/${inst.agreementId}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-destructive/10 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{inst.clientName}</p>
                    <p className="text-xs text-muted-foreground">Instalment #{inst.number} — Due {inst.dueDate}</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{formatCurrency(inst.amount)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Agreements */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Agreements</CardTitle>
            <Link to="/broker/agreements" className="text-sm text-accent hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockAgreements.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  to={`/broker/agreements/${a.id}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
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

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivity.map((item) => (
                <div key={item.id} className="border-b border-border/50 pb-3 last:border-0">
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
    </div>
  );
}
