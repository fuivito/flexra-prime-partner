import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockClients, mockAgreements } from '@/data/mock-data';
import { calculateInstalments, formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Instalment } from '@/types';

const steps = ['Select Client', 'Policy Details', 'Configure Terms', 'Review'];

export default function DealBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  const [clientId, setClientId] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [policyStart, setPolicyStart] = useState('');
  const [policyEnd, setPolicyEnd] = useState('');
  const [insurerName, setInsurerName] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [instalmentCount, setInstalmentCount] = useState('12');

  const [schedule, setSchedule] = useState<Instalment[]>([]);

  const client = mockClients.find(c => c.id === clientId);
  const premium = parseFloat(premiumAmount) || 0;
  const downPct = parseFloat(downPaymentPercent) || 0;
  const instCount = parseInt(instalmentCount) || 12;

  const canNext = () => {
    if (step === 0) return !!clientId;
    if (step === 1) return premium > 0 && !!policyStart && !!policyEnd && !!insurerName;
    if (step === 2) return downPct > 0 && downPct < 100;
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      setSchedule(calculateInstalments(premium, downPct, instCount, new Date(policyStart)));
    }
    setStep(step + 1);
  };

  const handleCreate = () => {
    const id = `agr-${Date.now()}`;
    // In a real app, we'd persist this. For now just navigate.
    toast({ title: 'Agreement created', description: `Agreement for ${client?.companyName} has been created.` });
    navigate(`/broker/agreements/${mockAgreements[0].id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              i < step ? 'bg-accent text-accent-foreground' :
              i === step ? 'bg-primary text-primary-foreground' :
              'bg-secondary text-muted-foreground'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && 'Choose an existing client for this deal.'}
            {step === 1 && 'Enter the insurance policy details.'}
            {step === 2 && 'Set the financing terms.'}
            {step === 3 && 'Review the deal before creating.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {mockClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Premium Amount ($)</Label>
                <Input type="number" min="0" value={premiumAmount} onChange={(e) => setPremiumAmount(e.target.value)} placeholder="e.g. 100000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Start</Label>
                  <Input type="date" value={policyStart} onChange={(e) => setPolicyStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Policy End</Label>
                  <Input type="date" value={policyEnd} onChange={(e) => setPolicyEnd(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Insurer Name</Label>
                <Input value={insurerName} onChange={(e) => setInsurerName(e.target.value)} placeholder="e.g. Allianz Commercial" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Down Payment (%)</Label>
                <Input type="number" min="1" max="99" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Number of Instalments</Label>
                <Select value={instalmentCount} onValueChange={setInstalmentCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Premium:</span><span className="font-medium">{formatCurrency(premium)}</span>
                  <span className="text-muted-foreground">Down payment:</span><span className="font-medium">{formatCurrency(premium * downPct / 100)}</span>
                  <span className="text-muted-foreground">Financed:</span><span className="font-medium">{formatCurrency(premium - premium * downPct / 100)}</span>
                  <span className="text-muted-foreground">Monthly:</span><span className="font-medium">{formatCurrency((premium - premium * downPct / 100) / instCount)}</span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-lg bg-secondary p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{client?.companyName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Insurer</span><span className="font-medium">{insurerName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Premium</span><span className="font-medium">{formatCurrency(premium)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Down Payment</span><span className="font-medium">{downPct}% ({formatCurrency(premium * downPct / 100)})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Term</span><span className="font-medium">{instCount} months</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Policy Period</span><span className="font-medium">{policyStart} → {policyEnd}</span></div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(inst => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.number}</TableCell>
                      <TableCell>{inst.dueDate}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inst.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canNext()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Create Agreement <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
