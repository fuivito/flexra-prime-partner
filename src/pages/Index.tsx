import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, TrendingUp, Clock } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { useLocale } from '@/i18n/LocaleContext';

const Index = () => {
  const { t } = useLocale();

  const features = [
    { icon: Shield, title: t.landing.feature1Title, desc: t.landing.feature1Desc },
    { icon: TrendingUp, title: t.landing.feature2Title, desc: t.landing.feature2Desc },
    { icon: Clock, title: t.landing.feature3Title, desc: t.landing.feature3Desc },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="text-xl font-bold tracking-tight text-foreground">
            flexra<span className="text-accent">.</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" asChild>
              <Link to="/broker/login">{t.nav.brokerLogin}</Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/portal/login">{t.nav.policyholderLogin}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.landing.heroTitle1}{' '}
            <span className="text-accent">{t.landing.heroTitle2}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t.landing.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              <Link to="/broker/login">
                {t.landing.brokerPortal} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link to="/portal/login">{t.landing.policyholderPortal}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-secondary/30">
        <div className="container mx-auto px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border/50 bg-card p-8">
                <feature.icon className="h-10 w-10 text-accent" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          {t.landing.footer}
        </div>
      </footer>
    </div>
  );
};

export default Index;
