import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { Instalment, InstalmentStatus } from '@/types';
import { Check, Sparkles, Calendar, DollarSign, ArrowRight, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

// Mock cashflow data for AI feature
const mockCashflowMonths = [
  { month: '2026-03', score: 0.9, label: 'Mar' },
  { month: '2026-04', score: 0.5, label: 'Apr' },
  { month: '2026-05', score: 0.7, label: 'May' },
  { month: '2026-06', score: 0.4, label: 'Jun' },
  { month: '2026-07', score: 0.8, label: 'Jul' },
  { month: '2026-08', score: 0.6, label: 'Aug' },
  { month: '2026-09', score: 0.9, label: 'Sep' },
  { month: '2026-10', score: 0.3, label: 'Oct' },
  { month: '2026-11', score: 0.7, label: 'Nov' },
  { month: '2026-12', score: 0.85, label: 'Dec' },
  { month: '2027-01', score: 0.6, label: 'Jan' },
];

export default function PortalPayments() {
  const { toast } = useToast();
  const myAgreements = mockAgreements.filter(a => a.policyholderUserId === 'ph-1' && a.status === 'active');
  const agreement = myAgreements[0];
  const [instalments, setInstalments] = useState<Instalment[]>(agreement?.instalments || []);
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [smartApplied, setSmartApplied] = useState(false);

  if (!agreement) return <div className="text-muted-foreground">No active agreements.</div>;

  const upcomingInstalments = instalments.filter(i => i.status === 'upcoming');
  const paidInstalments = instalments.filter(i => i.status === 'paid');
  const overdueInstalments = instalments.filter(i => i.status === 'overdue');
  const totalRemaining = [...upcomingInstalments, ...overdueInstalments].reduce((s, i) => s + i.amount, 0);
  const totalPaid = paidInstalments.reduce((s, i) => s + i.amount, 0);
  const progressPercent = (totalPaid / (totalPaid + totalRemaining)) * 100;

  const selectedInst = instalments.find(i => i.id === selectedInstId);
  const minAmount = selectedInst ? Math.round(selectedInst.amount * 0.3) : 0;
  const maxAmount = selectedInst ? Math.round(selectedInst.amount * 2) : 0;

  const handleSelectInstalment = (inst: Instalment) => {
    if (inst.status !== 'upcoming') return;
    setSelectedInstId(inst.id);
    setSliderValue(inst.amount);
  };

  const handleSliderChange = (val: number[]) => {
    setSliderValue(val[0]);
  };

  const handleApplyAdjustment = () => {
    if (!selectedInstId) return;
    const newAmount = sliderValue;
    const oldInst = instalments.find(i => i.id === selectedInstId)!;
    const diff = oldInst.amount - newAmount;
    const otherUpcoming = upcomingInstalments.filter(i => i.id !== selectedInstId);

    if (otherUpcoming.length === 0) {
      toast({ title: 'Cannot adjust', description: 'Need at least 2 upcoming instalments to rebalance.', variant: 'destructive' });
      return;
    }

    const adjustPerInst = diff / otherUpcoming.length;
    setInstalments(instalments.map(i => {
      if (i.id === selectedInstId) return { ...i, amount: Math.round(newAmount * 100) / 100 };
      if (i.status === 'upcoming' && i.id !== selectedInstId) return { ...i, amount: Math.round((i.amount + adjustPerInst) * 100) / 100 };
      return i;
    }));

    setSelectedInstId(null);
    toast({ title: 'Instalment adjusted', description: 'Remaining instalments rebalanced automatically.' });
  };

  const handleSmartInstalments = () => {
    // AI-powered: redistribute based on mock cashflow scores
    const total = upcomingInstalments.reduce((s, i) => s + i.amount, 0);
    const relevant = mockCashflowMonths.filter(cf =>
      upcomingInstalments.some(i => i.dueDate.startsWith(cf.month))
    );
    const totalScore = relevant.reduce((s, cf) => s + cf.score, 0);

    setInstalments(instalments.map(inst => {
      if (inst.status !== 'upcoming') return inst;
      const cf = relevant.find(c => inst.dueDate.startsWith(c.month));
      if (!cf) return inst;
      const proportion = cf.score / totalScore;
      return { ...inst, amount: Math.round(total * proportion * 100) / 100 };
    }));

    setSmartApplied(true);
    setSelectedInstId(null);
    toast({
      title: '✨ Smart Instalments Applied',
      description: 'Payments have been optimised based on your predicted cash flow.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">{agreement.insurerName} — {agreement.clientName}</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Paid</p>
              <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
              <p className="text-xl font-bold">{formatCurrency(totalRemaining)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Due</p>
              <p className="text-xl font-bold">
                {upcomingInstalments[0] ? format(parseISO(upcomingInstalments[0].dueDate), 'dd MMM') : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-muted-foreground">{paidInstalments.length} of {instalments.length} instalments</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Smart Instalments */}
      <Card className="glass-card border-accent/20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Smart Instalments</h3>
              <p className="text-xs text-muted-foreground mt-1">
                AI analyses your company's predicted cash flow and redistributes payments to align with your strongest months.
                {smartApplied && <span className="text-success ml-1">✓ Applied</span>}
              </p>
              {/* Cashflow preview */}
              <div className="flex items-end gap-1 mt-3 h-12">
                {mockCashflowMonths.slice(0, 10).map(cf => (
                  <div key={cf.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${cf.score * 40}px`,
                        background: cf.score > 0.6 ? 'hsl(174, 76%, 39%)' : cf.score > 0.4 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)',
                        opacity: 0.6,
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground">{cf.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSmartInstalments}
              className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0"
              disabled={smartApplied}
            >
              {smartApplied ? 'Applied' : 'Optimise'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Instalments - modern cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Schedule</h2>
        <div className="space-y-2">
          {[...overdueInstalments, ...upcomingInstalments].map((inst) => (
            <Card
              key={inst.id}
              className={`glass-card transition-all cursor-pointer hover:shadow-md ${
                selectedInstId === inst.id ? 'ring-2 ring-accent shadow-lg' : ''
              } ${inst.status === 'overdue' ? 'border-destructive/30' : ''}`}
              onClick={() => handleSelectInstalment(inst)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                      inst.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                    }`}>
                      #{inst.number}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{format(parseISO(inst.dueDate), 'dd MMMM yyyy')}</p>
                      <p className="text-xs text-muted-foreground">Instalment #{inst.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">{formatCurrency(inst.amount)}</p>
                    <Badge variant="outline" className={instStatusColors[inst.status]}>{inst.status}</Badge>
                  </div>
                </div>

                {/* Slider adjustment for selected */}
                {selectedInstId === inst.id && inst.status === 'upcoming' && (
                  <div className="mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Adjust amount</span>
                      <span className="text-sm font-bold text-accent">{formatCurrency(sliderValue)}</span>
                    </div>
                    <Slider
                      value={[sliderValue]}
                      onValueChange={handleSliderChange}
                      min={minAmount}
                      max={maxAmount}
                      step={100}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{formatCurrency(minAmount)}</span>
                      <span>{formatCurrency(maxAmount)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleApplyAdjustment} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Apply & Rebalance
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedInstId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History - collapsible */}
      <div>
        <button
          className="flex items-center gap-2 text-lg font-semibold mb-4 hover:text-accent transition-colors"
          onClick={() => setShowHistory(!showHistory)}
        >
          Payment History
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <Badge variant="secondary" className="ml-1 text-xs">{paidInstalments.length}</Badge>
        </button>
        {showHistory && (
          <div className="space-y-2">
            {paidInstalments.map(inst => (
              <Card key={inst.id} className="glass-card opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{format(parseISO(inst.paidDate || inst.dueDate), 'dd MMMM yyyy')}</p>
                        <p className="text-xs text-muted-foreground">Instalment #{inst.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold">{formatCurrency(inst.amount)}</p>
                      <Badge variant="outline" className={instStatusColors.paid}>paid</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
