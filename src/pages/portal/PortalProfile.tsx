import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Shield, ChevronRight, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortalProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const myAgreements = mockAgreements.filter(a => a.policyholderUserId === 'ph-1');

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
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  const handleSavePayment = () => {
    setEditingPayment(false);
    toast({ title: 'Payment details updated', description: 'Your payment method has been saved.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and payment details</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-background/50" />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Details</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingPayment(!editingPayment)}
                className="text-accent hover:text-accent"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {editingPayment ? 'Cancel' : 'Edit'}
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
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Bank Name</Label>
                  <Input value={paymentForm.bankName} onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })} className="bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sort Code</Label>
                    <Input value={paymentForm.sortCode} onChange={(e) => setPaymentForm({ ...paymentForm, sortCode: e.target.value })} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Account Number</Label>
                    <Input value={paymentForm.accountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })} className="bg-background/50" />
                  </div>
                </div>
                <Button onClick={handleSavePayment} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                  Update Payment Details
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Bank</span>
                  <span className="text-sm font-medium">{paymentForm.bankName}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Sort Code</span>
                  <span className="text-sm font-medium">{paymentForm.sortCode}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">Account</span>
                  <span className="text-sm font-medium">{paymentForm.accountNumber}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Agreements - now links to full page */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">My Agreements</CardTitle>
          <CardDescription>Click an agreement to view full details and download</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {myAgreements.map(a => (
            <Link key={a.id} to={`/portal/agreements/${a.id}`}>
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/30 hover:bg-background/60 cursor-pointer transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{a.insurerName}</p>
                    <p className="text-xs text-muted-foreground">{a.policyPeriodStart} — {a.policyPeriodEnd}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(a.premiumAmount)}</p>
                  </div>
                  <Badge variant="outline" className={
                    a.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                    a.status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-accent/10 text-accent border-accent/20'
                  }>{a.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
