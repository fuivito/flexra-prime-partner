import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockClients } from '@/data/mock-data';
import { Plus, Search, Upload } from 'lucide-react';
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
            <DialogContent className="sm:max-w-md glass-card">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
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
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drop PDF here (mock)</p>
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">Add Client</Button>
              </form>
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
