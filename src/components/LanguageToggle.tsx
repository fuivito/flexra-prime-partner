import { useLocale, SupportedLocale } from '@/i18n/LocaleContext';

const locales: SupportedLocale[] = ['en', 'it'];

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center rounded-full border border-border/60 bg-background/50 p-0.5 text-xs font-medium">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-full px-2.5 py-1 uppercase transition-all ${
            locale === l
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
