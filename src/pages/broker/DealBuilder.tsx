import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { mockClients, mockAgreements } from '@/data/mock-data';
import { calculateInstalments, formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Search, Plus, Users, TrendingUp, FileText } from 'lucide-react';
import { Client } from '@/types';

const steps = [
  { label: 'Select Client', icon: Users },
  { label: 'Financing Parameters', icon: TrendingUp },
  { label: 'Review & Send', icon: FileText },
];

export default function DealBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [duration, setDuration] = useState('12');
  const [apr, setApr] = useState([15]);
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');

  const client = mockClients.find(c => c.id === clientId);
  const premium = parseFloat(premiumAmount) || 0;
  const instCount = parseInt(duration) || 12;
  const downPct = parseFloat(downPaymentPercent) || 0;

  const filteredClients = mockClients.filter(c =>
    c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Commissions preview
  const baseCommission = premium * 0.02;
  const totalRevenue = baseCommission;

  const canNext = () => {
    if (step === 0) return !!clientId;
    if (step === 1) return premium > 0;
    return true;
  };

  const handleCreate = () => {
    toast({ title: 'Agreement created', description: `Agreement for ${client?.companyName} has been sent.` });
    navigate(`/broker/agreements/${mockAgreements[0].id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back button + Title */}
      <div>
        <Button variant="ghost" className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/broker/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Create Agreement</h1>
        <p className="text-muted-foreground mt-1">Set up a new financing agreement for your client</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
              i < step ? 'bg-primary border-primary text-primary-foreground' :
              i === step ? 'border-primary text-primary bg-card' :
              'border-border text-muted-foreground bg-card'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
            </div>
            <span className={`hidden text-sm sm:inline ${i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border mx-2" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="glass-card">
        <CardContent className="p-4 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Select Client</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose an existing client or add a new one</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              <button
                onClick={() => navigate('/broker/clients')}
                className="w-full rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <Plus className="inline h-4 w-4 mr-1" /> Add new client
              </button>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClientId(c.id)}
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

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold">Financing Parameters</h2>
                <p className="text-sm text-muted-foreground mt-1">Set the premium amount, duration, and APR for this agreement</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Premium Amount ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      min="0"
                      value={premiumAmount}
                      onChange={(e) => setPremiumAmount(e.target.value)}
                      placeholder="e.g. 100,000"
                      className="pl-7 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Annual Percentage Rate (APR)</Label>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Baseline: 5%</span>
                    <span>Max: 25%</span>
                  </div>
                  <Slider
                    min={5}
                    max={25}
                    step={0.5}
                    value={apr}
                    onValueChange={setApr}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-center text-foreground mt-2">{apr[0].toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Down Payment (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>

              {/* Commissions Preview */}
              {premium > 0 && (
                <div className="glass-card rounded-xl p-6 border border-border/50">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <TrendingUp className="h-5 w-5 text-accent" /> Commissions Preview
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Base Commission</p>
                      <p className="text-lg font-bold">{formatCurrency(baseCommission)}</p>
                      <p className="text-xs text-muted-foreground">2% of premium</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Uplift Share</p>
                      <p className="text-lg font-bold">{formatCurrency(0)}</p>
                      <p className="text-xs text-muted-foreground">0.0% additional</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Broker Revenue</p>
                      <p className="text-lg font-bold text-accent">{formatCurrency(totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">2.0% of premium</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold">Review & Send</h2>
                <p className="text-sm text-muted-foreground mt-1">Review the agreement details before sending to your client</p>
              </div>

              {/* Agreement Summary */}
              <div className="glass-card rounded-xl p-6 border border-border/50 space-y-6">
                <h3 className="text-lg font-semibold">Agreement Summary</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-semibold text-lg">{client?.companyName}</p>
                    <p className="text-sm text-muted-foreground">{client?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Premium Amount</p>
                    <p className="font-semibold text-lg">{formatCurrency(premium)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{instCount} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">APR</p>
                    <p className="font-semibold">{apr[0].toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Down Payment</p>
                    <p className="font-semibold">{downPct}% ({formatCurrency(premium * downPct / 100)})</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Your Revenue</p>
                    <p className="font-semibold text-accent">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className="glass-card rounded-xl p-6 border border-border/50">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <FileText className="h-5 w-5" /> Agreement Document Preview
                </h3>
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">Financing Agreement</p>
                  <p className="text-sm mt-1">A professional PDF document will be generated and sent to your client</p>
                  <ul className="text-sm mt-4 space-y-1">
                    <li>• Terms and conditions</li>
                    <li>• Payment schedule</li>
                    <li>• Client signature required</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-8">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/broker/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/broker/dashboard')}>Cancel</Button>
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleCreate} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  Send Agreement <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
