import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { en, it, Translations } from './translations';
import { enUS, Locale as DateFnsLocale } from 'date-fns/locale';

// Lazy-load Italian locale to keep bundle small when not used
let cachedItLocale: DateFnsLocale | null = null;
async function loadItLocale(): Promise<DateFnsLocale> {
  if (cachedItLocale) return cachedItLocale;
  const mod = await import('date-fns/locale/it');
  cachedItLocale = mod.default ?? mod.it ?? (mod as unknown as DateFnsLocale);
  return cachedItLocale;
}

export type SupportedLocale = 'en' | 'it';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: Translations;
  dateFnsLocale: DateFnsLocale;
  currencyLocale: string;
  currency: string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  t: en,
  dateFnsLocale: enUS,
  currencyLocale: 'en-US',
  currency: 'USD',
});

const translationMap: Record<SupportedLocale, Translations> = { en, it };
const currencyMap: Record<SupportedLocale, { currencyLocale: string; currency: string }> = {
  en: { currencyLocale: 'en-US', currency: 'USD' },
  it: { currencyLocale: 'it-IT', currency: 'EUR' },
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [dateFnsLocale, setDateFnsLocale] = useState<DateFnsLocale>(enUS);

  const setLocale = useCallback((l: SupportedLocale) => {
    setLocaleState(l);
    document.documentElement.lang = l;
    if (l === 'it') {
      loadItLocale().then(setDateFnsLocale);
    } else {
      setDateFnsLocale(enUS);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translationMap[locale];
  const { currencyLocale, currency } = currencyMap[locale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dateFnsLocale, currencyLocale, currency }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
