import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Shield, ChevronRight, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

export default function PortalProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, currencyLocale, currency } = useLocale();
  const { agreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const myAgreements = agreements.filter(a => a.policyholderUserId === 'ph-1');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });

  const [paymentForm, setPaymentForm] = useState({
    cardLast4: '4242',
    cardBrand: 'Visa',
    bankName: 'HSBC UK',
    sortCode: '40-47-84',
    accountNumber: '****7890',
  });

  const [editingPayment, setEditingPayment] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t.portal.profile.profileUpdated, description: t.portal.profile.profileUpdatedDesc });
  };

  const handleSavePayment = () => {
    setEditingPayment(false);
    toast({ title: t.portal.profile.paymentUpdated, description: t.portal.profile.paymentUpdatedDesc });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.portal.profile.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.portal.profile.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">{t.portal.profile.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.fullName}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.email}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.phone}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.company}</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-background/50" />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">{t.portal.profile.saveChanges}</Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.portal.profile.paymentDetails}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingPayment(!editingPayment)}
                className="text-accent hover:text-accent"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {editingPayment ? t.common.cancel : t.portal.profile.edit}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <div className="flex items-center justify-between mb-6">
                <CreditCard className="h-6 w-6" />
                <span className="text-xs opacity-80">{paymentForm.cardBrand}</span>
              </div>
              <p className="text-lg tracking-[0.2em] font-mono">•••• •••• •••• {paymentForm.cardLast4}</p>
              <p className="text-xs opacity-60 mt-2">{user?.name}</p>
            </div>

            {editingPayment ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.bankName}</Label>
                  <Input value={paymentForm.bankName} onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })} className="bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.sortCode}</Label>
                    <Input value={paymentForm.sortCode} onChange={(e) => setPaymentForm({ ...paymentForm, sortCode: e.target.value })} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.portal.profile.accountNumber}</Label>
                    <Input value={paymentForm.accountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })} className="bg-background/50" />
                  </div>
                </div>
                <Button onClick={handleSavePayment} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                  {t.portal.profile.updatePayment}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">{t.portal.profile.bank}</span>
                  <span className="text-sm font-medium">{paymentForm.bankName}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">{t.portal.profile.sortCode}</span>
                  <span className="text-sm font-medium">{paymentForm.sortCode}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">{t.portal.profile.account}</span>
                  <span className="text-sm font-medium">{paymentForm.accountNumber}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Agreements */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t.portal.profile.myAgreements}</CardTitle>
          <CardDescription>{t.portal.profile.myAgreementsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {myAgreements.map(a => (
            <Link key={a.id} to={`/portal/agreements/${a.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background/30 hover:bg-background/60 cursor-pointer transition-all group gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.insurerName}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.policyPeriodStart} — {a.policyPeriodEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-14 sm:ml-0">
                  <p className="font-bold">{fmt(a.premiumAmount)}</p>
                  <Badge variant="outline" className={
                    a.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                    a.status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-accent/10 text-accent border-accent/20'
                  }>{a.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
