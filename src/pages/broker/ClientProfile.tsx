import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockClients, mockAgreements } from '@/data/mock-data';
import { formatCurrency } from '@/lib/calculator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientProfile() {
  const { id } = useParams();
  const client = mockClients.find(c => c.id === id);
  const agreements = mockAgreements.filter(a => a.clientId === id);

  if (!client) return <div className="text-muted-foreground">Client not found.</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link to="/broker/clients"><ArrowLeft className="h-4 w-4" /> Back to Clients</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{client.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Contact Person</p><p className="font-medium">{client.contactPerson}</p></div>
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{client.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{client.phone}</p></div>
            <div><p className="text-xs text-muted-foreground">Business Type</p><p className="font-medium">{client.businessType}</p></div>
            <div><p className="text-xs text-muted-foreground">Added</p><p className="font-medium">{client.createdAt}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agreements ({agreements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {agreements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insurer</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link to={`/broker/agreements/${a.id}`} className="font-medium hover:text-accent">{a.insurerName}</Link>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(a.premiumAmount)}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No agreements yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
