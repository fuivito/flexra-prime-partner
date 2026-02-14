import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { Instalment, InstalmentStatus } from '@/types';
import { Pencil, Check, X } from 'lucide-react';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalPayments() {
  const { toast } = useToast();
  const myAgreements = mockAgreements.filter(a => a.policyholderUserId === 'ph-1' && a.status === 'active');
  
  // Use first active agreement for instalment management
  const agreement = myAgreements[0];
  const [instalments, setInstalments] = useState<Instalment[]>(agreement?.instalments || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  if (!agreement) return <div className="text-muted-foreground">No active agreements.</div>;

  const upcomingInstalments = instalments.filter(i => i.status === 'upcoming');
  const totalRemaining = upcomingInstalments.reduce((s, i) => s + i.amount, 0);

  const handleEdit = (inst: Instalment) => {
    setEditingId(inst.id);
    setEditAmount(inst.amount.toString());
  };

  const handleSave = (instId: string) => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    const oldInst = instalments.find(i => i.id === instId)!;
    const diff = oldInst.amount - newAmount;
    const otherUpcoming = upcomingInstalments.filter(i => i.id !== instId);

    if (otherUpcoming.length === 0) {
      toast({ title: 'Cannot adjust', description: 'Need at least 2 upcoming instalments to rebalance.', variant: 'destructive' });
      return;
    }

    const adjustPerInst = diff / otherUpcoming.length;

    setInstalments(instalments.map(i => {
      if (i.id === instId) return { ...i, amount: Math.round(newAmount * 100) / 100 };
      if (i.status === 'upcoming' && i.id !== instId) return { ...i, amount: Math.round((i.amount + adjustPerInst) * 100) / 100 };
      return i;
    }));

    setEditingId(null);
    toast({ title: 'Instalment adjusted', description: 'Remaining instalments rebalanced.' });
  };

  return (
    <div className="space-y-6">
      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instalments.filter(i => i.status === 'paid').map(inst => (
                <TableRow key={inst.id}>
                  <TableCell>{inst.number}</TableCell>
                  <TableCell>{inst.paidDate || inst.dueDate}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(inst.amount)}</TableCell>
                  <TableCell><Badge variant="outline" className={instStatusColors.paid}>paid</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Schedule with Adjustment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Instalments</CardTitle>
            <span className="text-sm text-muted-foreground">Total remaining: {formatCurrency(totalRemaining)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instalments.filter(i => i.status !== 'paid').map(inst => (
                <TableRow key={inst.id}>
                  <TableCell>{inst.number}</TableCell>
                  <TableCell>{inst.dueDate}</TableCell>
                  <TableCell className="text-right">
                    {editingId === inst.id ? (
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="ml-auto w-28 text-right"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{formatCurrency(inst.amount)}</span>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline" className={instStatusColors[inst.status]}>{inst.status}</Badge></TableCell>
                  <TableCell>
                    {inst.status === 'upcoming' && (
                      editingId === inst.id ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSave(inst.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(inst)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
