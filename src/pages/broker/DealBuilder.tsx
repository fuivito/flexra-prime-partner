import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, APR, calculateMonthlyInstalment, calculateTotalInterest } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Search, Plus, Users, Building2, ShieldCheck, FileText, Loader2, CheckCircle2, XCircle, Download, Send } from 'lucide-react';
import { Client, Agreement } from '@/types';
import { generateAgreementPDF } from '@/lib/pdf-generator';
import { useLocale } from '@/i18n/LocaleContext';
import { useLocalizedMockData } from '@/i18n/mock-data-localized';

type CreditResult = 'pending' | 'running' | 'approved' | 'not_approved' | null;

export default function DealBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, currencyLocale, currency, dateFnsLocale } = useLocale();
  const { clients: mockClients, agreements: mockAgreements } = useLocalizedMockData();
  const fmt = (amount: number) => formatCurrency(amount, currencyLocale, currency);

  const steps = [
    { label: t.broker.dealBuilder.step1, icon: Users },
    { label: t.broker.dealBuilder.step2, icon: Building2 },
    { label: t.broker.dealBuilder.step3, icon: ShieldCheck },
    { label: t.broker.dealBuilder.step4, icon: FileText },
  ];

  const [step, setStep] = useState(0);

  // Step 1
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  // Step 2
  const [companyRegNumber, setCompanyRegNumber] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [instalmentCount, setInstalmentCount] = useState(10);

  // Step 3
  const [creditResult, setCreditResult] = useState<CreditResult>(null);

  const client = mockClients.find(c => c.id === clientId);
  const premium = parseFloat(premiumAmount) || 0;

  const filteredClients = mockClients
    .filter(c =>
      c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (a.id === clientId) return -1;
      if (b.id === clientId) return 1;
      return 0;
    });

  const handleSelectClient = (id: string) => {
    setClientId(id);
    const selected = mockClients.find(c => c.id === id);
    if (selected?.companyRegNumber) {
      setCompanyRegNumber(selected.companyRegNumber);
    } else {
      setCompanyRegNumber('');
    }
  };

  // Financing terms
  const apr = APR;
  const downPayment = premium * (downPaymentPercent / 100);
  const financedAmount = premium - downPayment;
  const monthlyInstalment = instalmentCount > 0 ? calculateMonthlyInstalment(financedAmount, instalmentCount) : 0;
  const totalInterest = instalmentCount > 0 ? calculateTotalInterest(financedAmount, instalmentCount) : 0;
  const totalRepayable = financedAmount + totalInterest;
  const brokerCommissionPercent = premium < 25000 ? 4.5 : premium <= 100000 ? 3.5 : 2.5;
  const brokerCommission = premium * (brokerCommissionPercent / 100);

  const canNext = () => {
    if (step === 0) return !!clientId;
    if (step === 1) return companyRegNumber.trim().length > 0 && premium > 0;
    if (step === 2) return creditResult === 'approved';
    return true;
  };

  const runCreditCheck = () => {
    setCreditResult('running');
    setTimeout(() => {
      setCreditResult('approved');
    }, 2500);
  };

  const handleNext = () => {
    if (step === 2 && creditResult === null) {
      runCreditCheck();
      return;
    }
    setStep(step + 1);
  };

  const handleDownloadPreview = () => {
    if (!client) return;
    const today = new Date().toISOString().split('T')[0];
    const mockAgreement: Agreement = {
      id: `draft-${Date.now()}`,
      clientId: client.id,
      clientName: client.companyName,
      premiumAmount: premium,
      policyPeriodStart: today,
      policyPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      insurerName: 'TBC',
      downPaymentPercent,
      instalmentCount,
      status: 'pending',
      createdAt: today,
      instalments: Array.from({ length: instalmentCount }, (_, i) => ({
        id: `draft-inst-${i + 1}`,
        agreementId: `draft-${Date.now()}`,
        number: i + 1,
        amount: monthlyInstalment,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + i + 1)).toISOString().split('T')[0],
        status: 'upcoming' as const,
      })),
    };
    generateAgreementPDF(mockAgreement, { t, dateFnsLocale, currencyLocale, currency });
  };

  const handleCreate = () => {
    toast({ title: t.broker.dealBuilder.agreementSent, description: t.broker.dealBuilder.agreementSentDesc(client?.companyName || '') });
    navigate(`/broker/agreements/${mockAgreements[0].id}`);
  };

  const currencySymbol = currency === 'EUR' ? '\u20AC' : '\u00A3';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button variant="ghost" className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/broker/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> {t.broker.dealBuilder.backBtn}
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{t.broker.dealBuilder.title}</h1>
        <p className="text-muted-foreground mt-1">{t.broker.dealBuilder.subtitle}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
              i < step ? 'bg-primary border-primary text-primary-foreground' :
              i === step ? 'border-primary text-primary bg-card' :
              'border-border text-muted-foreground bg-card'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
            </div>
            <span className={`hidden text-xs sm:inline ${i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border mx-1" />}
          </div>
        ))}
      </div>

      <Card className="glass-card">
        <CardContent className="p-4 sm:p-8">

          {/* Step 1: Select Client */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t.broker.dealBuilder.selectClientTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.selectClientDesc}</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.broker.dealBuilder.searchPlaceholder}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              <button
                onClick={() => navigate('/broker/clients')}
                className="w-full rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <Plus className="inline h-4 w-4 mr-1" /> {t.broker.dealBuilder.addNewClient}
              </button>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      clientId === c.id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                    }`}
                  >
                    <p className="font-medium text-foreground">{c.companyName}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                    <p className="text-sm text-muted-foreground">{c.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t.broker.dealBuilder.companyDetailsTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.companyDetailsDesc}</p>
              </div>

              {client && (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t.broker.dealBuilder.selectedClient}</p>
                  <p className="font-medium text-foreground">{client.companyName}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t.broker.dealBuilder.companyRegNumber}</Label>
                <Input
                  value={companyRegNumber}
                  onChange={(e) => setCompanyRegNumber(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  {client?.companyRegNumber ? t.broker.dealBuilder.regPreFilled : t.broker.dealBuilder.regLookup}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t.broker.dealBuilder.premiumAmount}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                  <Input
                    type="number"
                    min="0"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                    placeholder="e.g. 50,000"
                    className="pl-7 bg-background/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.premiumAmountDesc}</p>
              </div>

              {premium > 0 && (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">{t.broker.dealBuilder.financingOptions}</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t.broker.dealBuilder.downPayment}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t.broker.dealBuilder.numberOfInstalments}</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={instalmentCount}
                        onChange={(e) => setInstalmentCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.broker.dealBuilder.totalPremium} <span className="font-semibold text-foreground">{fmt(premium)}</span></span>
                    <span className="text-xs text-muted-foreground italic">{t.broker.dealBuilder.aprNote}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Credit Assessment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t.broker.dealBuilder.creditTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.creditDesc}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t.broker.dealBuilder.company}</p>
                  <p className="text-sm text-foreground">{client?.companyName}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t.broker.dealBuilder.regNo}</p>
                  <p className="text-sm text-foreground font-mono">{companyRegNumber}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t.broker.dealBuilder.premiumAmountLabel}</p>
                  <p className="text-sm text-foreground">{fmt(premium)}</p>
                </div>
              </div>

              {creditResult === null && (
                <div className="text-center py-6">
                  <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">{t.broker.dealBuilder.clickToRun}</p>
                  <Button onClick={runCreditCheck} className="gap-2 rounded-full px-6">
                    <ShieldCheck className="h-4 w-4" /> {t.broker.dealBuilder.runCreditCheck}
                  </Button>
                </div>
              )}

              {creditResult === 'running' && (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="font-medium text-foreground">{t.broker.dealBuilder.runningCredit}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.checkingBureaus}</p>
                </div>
              )}

              {creditResult === 'approved' && (
                <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 space-y-4">
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-accent mb-3" />
                    <p className="text-lg font-semibold text-foreground">{t.broker.dealBuilder.approved}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.approvedDesc}</p>
                  </div>
                  <div className="border-t border-accent/20 pt-4 flex items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">{t.broker.dealBuilder.yourRate}</p>
                    <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">{apr}% {t.broker.dealBuilder.apr}</span>
                  </div>
                </div>
              )}

              {creditResult === 'not_approved' && (
                <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6 text-center">
                  <XCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
                  <p className="text-lg font-semibold text-foreground">{t.broker.dealBuilder.notApproved}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.notApprovedDesc}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Send */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold">{t.broker.dealBuilder.reviewTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.broker.dealBuilder.reviewDesc}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/10 p-6 space-y-6">
                <h3 className="text-lg font-semibold">{t.broker.dealBuilder.agreementSummary}</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.client}</p>
                    <p className="font-semibold text-lg">{client?.companyName}</p>
                    <p className="text-sm text-muted-foreground">{client?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.companyRegNoLabel}</p>
                    <p className="font-semibold font-mono">{companyRegNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.premiumAmountLabel}</p>
                    <p className="font-semibold text-lg">{fmt(premium)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.creditAssessment}</p>
                    <p className="font-semibold text-accent flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> {t.broker.dealBuilder.approved}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t.broker.dealBuilder.financingBreakdown}</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.downPaymentLabel(downPaymentPercent)}</p>
                      <p className="font-semibold">{fmt(downPayment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.financedAmount}</p>
                      <p className="font-semibold">{fmt(financedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.monthlyPayment}</p>
                      <p className="font-semibold">{fmt(monthlyInstalment)} × {instalmentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.apr}</p>
                      <p className="font-semibold">{apr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.totalInterest}</p>
                      <p className="font-semibold">{fmt(totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.broker.dealBuilder.totalCustomerPays}</p>
                      <p className="font-semibold">{fmt(downPayment + totalRepayable)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t.broker.dealBuilder.brokerEarnings}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.broker.dealBuilder.commissionLabel(brokerCommissionPercent)}</p>
                    <p className="text-lg font-bold text-accent">{fmt(brokerCommission)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/10 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <FileText className="h-5 w-5" /> {t.broker.dealBuilder.agreementDocument}
                </h3>
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">{t.broker.dealBuilder.docPreview}</p>
                  <p className="text-sm mt-1">{t.broker.dealBuilder.docPreviewDesc}</p>
                </div>
                <Button variant="outline" className="mt-4 gap-2 w-full" onClick={handleDownloadPreview}>
                  <Download className="h-4 w-4" /> {t.broker.dealBuilder.downloadPreview}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-8">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/broker/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t.common.back}
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/broker/dashboard')}>{t.common.cancel}</Button>
              {step < 3 ? (
                step === 2 && creditResult === null ? (
                  <Button onClick={runCreditCheck} className="gap-2 rounded-full px-6">
                    <ShieldCheck className="h-4 w-4" /> {t.broker.dealBuilder.runCreditCheck}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!canNext()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                    {t.common.next} <ArrowRight className="h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button onClick={handleCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  <Send className="h-4 w-4" /> {t.broker.dealBuilder.sendToClient}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
