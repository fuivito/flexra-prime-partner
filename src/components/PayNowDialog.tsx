import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { Building2, CreditCard, CheckCircle2, Loader2, Landmark, Wallet, Plus } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleContext';

interface PayNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  instalmentNumber: number;
  dueDate: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card';
  label: string;
  detail: string;
  icon: typeof Building2;
}

const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'bank-1', type: 'bank', label: 'National Business Bank', detail: '•••• 4829 · Sort 20-45-67', icon: Landmark },
  { id: 'card-1', type: 'card', label: 'Visa ending 3841', detail: 'Expires 09/27', icon: CreditCard },
  { id: 'card-2', type: 'card', label: 'Mastercard ending 7210', detail: 'Expires 03/28', icon: CreditCard },
];

export default function PayNowDialog({ open, onOpenChange, amount, instalmentNumber, dueDate }: PayNowDialogProps) {
  const { toast } = useToast();
  const { t, currencyLocale, currency } = useLocale();
  const fmt = (a: number) => formatCurrency(a, currencyLocale, currency);

  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [selectedMethod, setSelectedMethod] = useState(defaultPaymentMethods[0].id);
  const [showNewBank, setShowNewBank] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', sortCode: '', accountNumber: '' });

  const handleAddBank = () => {
    const id = `bank-new-${Date.now()}`;
    const added: PaymentMethod = {
      id,
      type: 'bank',
      label: newBank.name,
      detail: `•••• ${newBank.accountNumber.slice(-4)} · Sort ${newBank.sortCode}`,
      icon: Landmark,
    };
    setMethods(prev => [...prev, added]);
    setSelectedMethod(id);
    setShowNewBank(false);
    setNewBank({ name: '', sortCode: '', accountNumber: '' });
  };

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
      toast({
        title: t.components.payNow.paymentSubmitted,
        description: t.components.payNow.paymentSubmittedDesc(fmt(amount), instalmentNumber),
      });
      setTimeout(() => {
        onOpenChange(false);
        setConfirmed(false);
      }, 1500);
    }, 1200);
  };

  const handleClose = (val: boolean) => {
    if (!processing) {
      onOpenChange(val);
      if (!val) {
        setConfirmed(false);
        setShowNewBank(false);
        setNewBank({ name: '', sortCode: '', accountNumber: '' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <p className="text-lg font-semibold">{t.components.payNow.paymentSubmittedTitle}</p>
            <p className="text-sm text-muted-foreground">{t.components.payNow.processingAmount(fmt(amount))}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-destructive" />
                {t.components.payNow.confirmPayment}
              </DialogTitle>
              <DialogDescription>
                {t.components.payNow.reviewDesc}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Amount summary */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-xs text-muted-foreground">{t.components.payNow.instalmentNumber(instalmentNumber)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.components.payNow.dueLabel} {dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{fmt(amount)}</p>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{t.common.overdue}</Badge>
                </div>
              </div>

              {/* Payment method selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{t.components.payNow.paymentMethod}</p>
                </div>
                {methods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-accent/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.detail}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                      )}
                    </button>
                  );
                })}

                {!showNewBank ? (
                  <button
                    type="button"
                    onClick={() => setShowNewBank(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 text-left transition-all hover:border-accent hover:bg-accent/5"
                  >
                    <div className="h-8 w-8 rounded-md flex items-center justify-center bg-muted">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{t.components.payNow.addNewBank}</p>
                  </button>
                ) : (
                  <div className="space-y-3 p-3 rounded-lg border border-accent bg-accent/5">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-accent" />
                      {t.components.payNow.newBankAccount}
                    </p>
                    <div className="space-y-2">
                      <Input placeholder={t.components.payNow.accountHolder} value={newBank.name} onChange={e => setNewBank({...newBank, name: e.target.value})} className="bg-background/50 h-9 text-sm" />
                      <Input placeholder={t.components.payNow.sortCodePlaceholder} value={newBank.sortCode} onChange={e => setNewBank({...newBank, sortCode: e.target.value})} className="bg-background/50 h-9 text-sm" />
                      <Input placeholder={t.components.payNow.accountNumberPlaceholder} value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} className="bg-background/50 h-9 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => { setShowNewBank(false); setNewBank({ name: '', sortCode: '', accountNumber: '' }); }}>
                        {t.components.payNow.cancel}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={!newBank.name || !newBank.sortCode || !newBank.accountNumber}
                        onClick={handleAddBank}
                      >
                        {t.components.payNow.addAndSelect}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => handleClose(false)} disabled={processing}>
                {t.common.cancel}
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.components.payNow.processing}
                  </>
                ) : (
                  t.components.payNow.payAmount(fmt(amount))
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
