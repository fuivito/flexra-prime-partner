import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockClients } from '@/data/mock-data';
import { Plus, Search, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';

export default function BrokerClients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '', businessType: '' });

  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `client-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients([newClient, ...clients]);
    setForm({ companyName: '', contactPerson: '', email: '', phone: '', businessType: '' });
    setDialogOpen(false);
    toast({ title: 'Client added', description: `${form.companyName} has been added.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5">
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg glass-card p-0 gap-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl font-bold">Add Client</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Upload a PDF document or enter client details manually
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="upload" className="w-full">
                <div className="px-6">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>
                </div>

                {/* Upload PDF Tab */}
                <TabsContent value="upload" className="p-6 pt-4 space-y-4">
                  <div className="rounded-xl border-2 border-dashed border-border p-10 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">Upload PDF Document</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">Supported format: PDF (max 10MB)</p>
                  </div>
                  {/* AI extraction note */}
                  <div className="flex items-start gap-2 rounded-lg bg-accent/5 border border-accent/20 p-3">
                    <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Our AI will automatically extract client details from your PDF, so you don't have to enter them manually.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" className="rounded-full px-5" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5">Save Client</Button>
                  </div>
                </TabsContent>

                {/* Manual Entry Tab */}
                <TabsContent value="manual" className="p-6 pt-4">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="bg-background/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business Type</Label>
                      <Input required value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="bg-background/50" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5">Save Client</Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Clients ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/broker/clients/${c.id}`)}
                className="flex items-center justify-between rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{c.companyName}</p>
                  <p className="text-sm text-muted-foreground">{c.contactPerson} · {c.email}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{c.businessType}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}