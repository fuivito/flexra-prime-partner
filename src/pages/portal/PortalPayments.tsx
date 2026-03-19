import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { Instalment, InstalmentStatus } from '@/types';
import { Check, Sparkles, Calendar, DollarSign, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import PayNowDialog from '@/components/PayNowDialog';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

const instStatusColors: Record<InstalmentStatus, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  upcoming: 'bg-accent/10 text-accent border-accent/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function PortalPayments() {
  const { toast } = useToast();
  const { t, currencyLocale, currency, dateFnsLocale } = useLocale();
  const { agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const myAgreements = agreements.filter(a => a.policyholderUserId === 'ph-1' && a.status === 'active');
  const agreement = myAgreements[0];
  const [instalments, setInstalments] = useState<Instalment[]>(agreement?.instalments || []);
  const [editMode, setEditMode] = useState(false);
  const [editAmounts, setEditAmounts] = useState<Record<string, number>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [payDialogInst, setPayDialogInst] = useState<Instalment | null>(null);
  const [smartApplied, setSmartApplied] = useState(false);
  const _ = smartApplied;

  if (!agreement) return <div className="text-muted-foreground">{t.portal.payments.noActive}</div>;

  const mockCashflowMonths = [
    { month: '2026-03', score: 0.9, label: t.months.short[2] },
    { month: '2026-04', score: 0.5, label: t.months.short[3] },
    { month: '2026-05', score: 0.7, label: t.months.short[4] },
    { month: '2026-06', score: 0.4, label: t.months.short[5] },
    { month: '2026-07', score: 0.8, label: t.months.short[6] },
    { month: '2026-08', score: 0.6, label: t.months.short[7] },
    { month: '2026-09', score: 0.9, label: t.months.short[8] },
    { month: '2026-10', score: 0.3, label: t.months.short[9] },
    { month: '2026-11', score: 0.7, label: t.months.short[10] },
    { month: '2026-12', score: 0.85, label: t.months.short[11] },
    { month: '2027-01', score: 0.6, label: t.months.short[0] },
  ];

  const upcomingInstalments = instalments.filter(i => i.status === 'upcoming');
  const paidInstalments = instalments.filter(i => i.status === 'paid');
  const overdueInstalments = instalments.filter(i => i.status === 'overdue');
  const totalUpcoming = upcomingInstalments.reduce((s, i) => s + i.amount, 0);
  const totalPaid = paidInstalments.reduce((s, i) => s + i.amount, 0);
  const totalRemaining = [...upcomingInstalments, ...overdueInstalments].reduce((s, i) => s + i.amount, 0);
  const progressPercent = (totalPaid / (totalPaid + totalRemaining)) * 100;

  const minPerInst = 200;
  const equalShare = upcomingInstalments.length > 0 ? totalUpcoming / upcomingInstalments.length : 0;
  const sliderMax = Math.round(equalShare * 2);

  const enterEditMode = () => {
    const snapshot: Record<string, number> = {};
    upcomingInstalments.forEach(i => { snapshot[i.id] = i.amount; });
    setEditAmounts(snapshot);
    setEditMode(true);
  };

  const handleSliderChange = (changedId: string, val: number[]) => {
    const newVal = val[0];
    const oldVal = editAmounts[changedId] ?? 0;
    const diff = oldVal - newVal;

    const otherIds = upcomingInstalments.filter(i => i.id !== changedId).map(i => i.id);
    if (otherIds.length === 0) return;

    const otherTotal = otherIds.reduce((s, id) => s + (editAmounts[id] ?? 0), 0);

    const newAmounts = { ...editAmounts, [changedId]: newVal };

    if (otherTotal > 0) {
      otherIds.forEach(id => {
        const proportion = (editAmounts[id] ?? 0) / otherTotal;
        const adjusted = (editAmounts[id] ?? 0) + diff * proportion;
        newAmounts[id] = Math.max(minPerInst, Math.round(adjusted * 100) / 100);
      });
    } else {
      const perOther = diff / otherIds.length;
      otherIds.forEach(id => {
        newAmounts[id] = Math.max(minPerInst, Math.round(((editAmounts[id] ?? 0) + perOther) * 100) / 100);
      });
    }

    setEditAmounts(newAmounts);
  };

  const handleApplyAll = () => {
    setInstalments(instalments.map(i => {
      if (editAmounts[i.id] !== undefined) return { ...i, amount: editAmounts[i.id] };
      return i;
    }));
    setEditAmounts({});
    setEditMode(false);
    toast({ title: t.portal.payments.instalmentsAdjusted, description: t.portal.payments.allRebalanced });
  };

  const handleCancelEdit = () => {
    setEditAmounts({});
    setEditMode(false);
  };

  const handleSmartInstalments = () => {
    const total = upcomingInstalments.reduce((s, i) => s + i.amount, 0);
    const relevant = mockCashflowMonths.filter(cf =>
      upcomingInstalments.some(i => i.dueDate.startsWith(cf.month))
    );
    const totalScore = relevant.reduce((s, cf) => s + cf.score, 0);

    const newInstalments = instalments.map(inst => {
      if (inst.status !== 'upcoming') return inst;
      const cf = relevant.find(c => inst.dueDate.startsWith(c.month));
      if (!cf) return inst;
      const proportion = cf.score / totalScore;
      return { ...inst, amount: Math.round(total * proportion * 100) / 100 };
    });

    setInstalments(newInstalments);

    if (editMode) {
      const snapshot: Record<string, number> = {};
      newInstalments.filter(i => i.status === 'upcoming').forEach(i => { snapshot[i.id] = i.amount; });
      setEditAmounts(snapshot);
    }

    toast({
      title: t.portal.payments.smartAppliedTitle,
      description: t.portal.payments.smartAppliedDesc,
    });
  };

  const getDisplayAmount = (inst: Instalment) => {
    if (editMode && editAmounts[inst.id] !== undefined) return editAmounts[inst.id];
    return inst.amount;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.portal.payments.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{agreement.insurerName} — {agreement.clientName}</p>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.payments.paidLabel}</p>
              <p className="text-xl font-bold">{fmt(totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.payments.remainingLabel}</p>
              <p className="text-xl font-bold">{fmt(totalRemaining)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.payments.nextDue}</p>
              <p className="text-xl font-bold">
                {upcomingInstalments[0] ? format(parseISO(upcomingInstalments[0].dueDate), 'dd MMM', { locale: dateFnsLocale }) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.portal.payments.paymentProgress}</span>
            <span className="text-sm text-muted-foreground">{t.portal.payments.instalmentProgress(paidInstalments.length, instalments.length)}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Smart Instalments */}
      <Card className="glass-card border-accent/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{t.portal.payments.smartInstalments}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t.portal.payments.smartDesc}
                {smartApplied && <span className="text-success ml-1">{t.portal.payments.lastApplied}</span>}
              </p>
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
            >
              {t.portal.payments.optimise}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Instalments */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t.portal.payments.upcomingSchedule}</h2>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" /> {t.common.cancel}
                </Button>
                <Button size="sm" onClick={handleApplyAll} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {t.portal.payments.applyChanges}
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={enterEditMode} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> {t.portal.payments.editAmounts}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {[...overdueInstalments, ...upcomingInstalments].map((inst) => {
            const isUpcoming = inst.status === 'upcoming';
            const displayAmt = getDisplayAmount(inst);

            return (
              <Card
                key={inst.id}
                className={`glass-card transition-all ${inst.status === 'overdue' ? 'border-destructive/30' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                        inst.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                      }`}>
                        #{inst.number}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{format(parseISO(inst.dueDate), 'dd MMMM yyyy', { locale: dateFnsLocale })}</p>
                        <p className="text-xs text-muted-foreground">{t.portal.payments.instalmentNumber(inst.number)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                      <p className={`text-base sm:text-lg font-bold ${editMode && editAmounts[inst.id] !== undefined && editAmounts[inst.id] !== inst.amount ? 'text-accent' : ''}`}>
                        {fmt(displayAmt)}
                      </p>
                      <Badge variant="outline" className={instStatusColors[inst.status]}>{inst.status}</Badge>
                      {inst.status === 'overdue' && (
                        <Button
                          size="sm"
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => setPayDialogInst(inst)}
                        >
                          {t.portal.payments.payNow}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isUpcoming && (
                    <div className={`mt-3 pt-3 border-t border-border/30 transition-opacity ${editMode ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-muted-foreground">{fmt(minPerInst)}</span>
                        <span className="text-[10px] text-muted-foreground">{fmt(sliderMax)}</span>
                      </div>
                      <Slider
                        value={[displayAmt]}
                        onValueChange={(val) => handleSliderChange(inst.id, val)}
                        min={minPerInst}
                        max={sliderMax}
                        step={50}
                        disabled={!editMode}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="max-w-3xl mx-auto">
        <button
          className="flex items-center gap-2 text-lg font-semibold mb-4 hover:text-accent transition-colors"
          onClick={() => setShowHistory(!showHistory)}
        >
          {t.portal.payments.paymentHistory}
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
                        <p className="font-medium text-sm">{format(parseISO(inst.paidDate || inst.dueDate), 'dd MMMM yyyy', { locale: dateFnsLocale })}</p>
                        <p className="text-xs text-muted-foreground">{t.portal.payments.instalmentNumber(inst.number)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold">{fmt(inst.amount)}</p>
                      <Badge variant="outline" className={instStatusColors.paid}>{t.common.paid}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
