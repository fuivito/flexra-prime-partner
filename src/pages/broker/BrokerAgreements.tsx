import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/calculator';
import { useState } from 'react';
import { AgreementStatus } from '@/types';
import { Search } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

const statusColors: Record<AgreementStatus, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function BrokerAgreements() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, currencyLocale, currency } = useLocale();
  const { agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');

  const filtered = agreements.filter(a => {
    const matchesSearch = a.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.broker.agreements.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder={t.common.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all}</SelectItem>
            <SelectItem value="active">{t.common.active}</SelectItem>
            <SelectItem value="pending">{t.common.pending}</SelectItem>
            <SelectItem value="completed">{t.common.completed}</SelectItem>
            <SelectItem value="overdue">{t.common.overdue}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t.broker.agreements.allAgreements(filtered.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/broker/agreements/${a.id}`)}
                className="flex items-center justify-between rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{a.clientName}</p>
                  <p className="text-sm text-muted-foreground">{a.insurerName} · {a.instalmentCount}mo</p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-sm font-semibold">{fmt(a.premiumAmount)}</span>
                  <Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
