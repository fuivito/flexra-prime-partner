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
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { Building2, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';

interface PayNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  instalmentNumber: number;
  dueDate: string;
}

const mockBankDetails = {
  accountName: 'TechCorp Solutions Ltd',
  bank: 'National Business Bank',
  accountNumber: '•••• •••• 4829',
  sortCode: '20-45-67',
};

export default function PayNowDialog({ open, onOpenChange, amount, instalmentNumber, dueDate }: PayNowDialogProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
      toast({
        title: 'Payment submitted',
        description: `${formatCurrency(amount)} for instalment #${instalmentNumber} is being processed.`,
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
      if (!val) setConfirmed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <p className="text-lg font-semibold">Payment Submitted</p>
            <p className="text-sm text-muted-foreground">Processing {formatCurrency(amount)}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-destructive" />
                Confirm Payment
              </DialogTitle>
              <DialogDescription>
                Review your bank details and confirm payment for the overdue instalment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Amount summary */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-xs text-muted-foreground">Instalment #{instalmentNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">overdue</Badge>
                </div>
              </div>

              {/* Bank details */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Paying from</p>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium text-right">{mockBankDetails.accountName}</span>
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium text-right">{mockBankDetails.bank}</span>
                  <span className="text-muted-foreground">Account No.</span>
                  <span className="font-mono text-right">{mockBankDetails.accountNumber}</span>
                  <span className="text-muted-foreground">Sort Code</span>
                  <span className="font-mono text-right">{mockBankDetails.sortCode}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => handleClose(false)} disabled={processing}>
                Cancel
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : (
                  `Pay ${formatCurrency(amount)}`
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
