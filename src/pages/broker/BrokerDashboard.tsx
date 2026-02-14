import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAgreements, mockActivity } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useState } from 'react';
import { FileText, DollarSign, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AgreementStatus } from '@/types';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function BrokerDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeAgreements = mockAgreements.filter(a => a.status === 'active').length;
  const totalVolume = mockAgreements.reduce((sum, a) => sum + a.premiumAmount, 0);
  const pendingDeals = mockAgreements.filter(a => a.status === 'pending').length;

  const filtered = mockAgreements.filter(a => {
    const matchesSearch = a.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="text-3xl font-bold">{activeAgreements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Financing Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalVolume)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingDeals}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agreements Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agreements</CardTitle>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Input placeholder="Search by client name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Insurer</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link to={`/broker/agreements/${a.id}`} className="font-medium text-foreground hover:text-accent">
                        {a.clientName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.insurerName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(a.premiumAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[a.status]}>
                        {a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivity.map((item) => (
                <div key={item.id} className="border-b border-border pb-3 last:border-0">
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
