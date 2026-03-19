import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/i18n/LocaleContext';
import LanguageToggle from '@/components/LanguageToggle';

export default function PortalLogin() {
  const [email, setEmail] = useState('james@techcorp.com');
  const [password, setPassword] = useState('password');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password, 'policyholder')) {
      toast({ title: t.auth.welcomeBack, description: t.auth.loggedInPolicyholder });
      navigate('/portal/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            flexra<span className="text-accent">.</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">{t.auth.policyholderPortal}</p>
          <div className="mt-3 flex justify-center"><LanguageToggle /></div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t.common.signIn}</CardTitle>
            <CardDescription>{t.auth.policyholderLoginDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.common.password}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {t.common.signIn}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
