import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft, Shield, Building, Calendar, DollarSign, FileDown, Phone, Mail, MapPin, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateAgreementPDF } from '@/lib/pdf-generator';


const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-muted text-muted-foreground',
  pending: 'bg-accent/10 text-accent border-accent/20',
};

export default function PortalAgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const agreement = mockAgreements.find(a => a.id === id);

  if (!agreement) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Agreement not found.</p>
        <Link to="/portal/profile" className="text-accent hover:underline mt-2 inline-block">Back to profile</Link>
      </div>
    );
  }

  const paidCount = agreement.instalments.filter(i => i.status === 'paid').length;
  const progressPercent = (paidCount / agreement.instalments.length) * 100;
  const financedAmount = agreement.premiumAmount * (1 - agreement.downPaymentPercent / 100);
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/portal/profile">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{agreement.insurerName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Agreement #{agreement.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-12 sm:ml-0">
          <Badge variant="outline" className={statusColors[agreement.status] || ''}>{agreement.status}</Badge>
          <Button onClick={() => generateAgreementPDF(agreement)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">Download</span> Agreement
          </Button>
        </div>
      </div>

      {/* Key financials */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Premium</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(agreement.premiumAmount)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Down Payment</p>
            <p className="text-2xl font-bold mt-1">{agreement.downPaymentPercent}%</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(agreement.premiumAmount * agreement.downPaymentPercent / 100)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Financed Amount</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(financedAmount)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Instalments</p>
            <p className="text-xl md:text-2xl font-bold mt-1">{agreement.instalmentCount}</p>
            <p className="text-xs text-muted-foreground">monthly payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment progress */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-muted-foreground">{paidCount} of {agreement.instalments.length} paid</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{Math.round(progressPercent)}% complete</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policy details */}
        <Card className="glass-card">
          <CardContent className="p-6 space-y-5">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" /> Policy Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Policy Reference</span>
                <span className="text-sm font-medium">POL-{agreement.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Start Date</span>
                <span className="text-sm font-medium">{format(parseISO(agreement.policyPeriodStart), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> End Date</span>
                <span className="text-sm font-medium">{format(parseISO(agreement.policyPeriodEnd), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> Type</span>
                <span className="text-sm font-medium">Insurance Premium Finance</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{format(parseISO(agreement.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurer contact */}
        <Card className="glass-card">
          <CardContent className="p-6 space-y-5">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-accent" /> Insurer Contact
            </h3>
            <div className="p-4 rounded-xl bg-background/30 space-y-4">
              <div>
                <p className="font-semibold">{agreement.insurerName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Underwriting & Claims</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+44 (0) 20 7946 0958</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>claims@{agreement.insurerName.toLowerCase().replace(/\s/g, '')}.co.uk</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>1 Lime Street, London EC3M 7HA</span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-base flex items-center gap-2 pt-2">
              <DollarSign className="h-4 w-4 text-accent" /> Finance Provider
            </h3>
            <div className="p-4 rounded-xl bg-background/30 space-y-4">
              <div>
                <p className="font-semibold">Flexra Finance</p>
                <p className="text-xs text-muted-foreground mt-0.5">Premium Finance</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+44 (0) 20 7123 4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>support@flexra.co.uk</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
