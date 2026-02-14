import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { useToast } from '@/hooks/use-toast';
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My Agreements</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insurer</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAgreements.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.insurerName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(a.premiumAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
