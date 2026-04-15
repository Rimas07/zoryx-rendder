'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations, translateSpec } from '../i18n';
import type { Lang, TKey } from '../i18n';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  tSpec: (spec: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');

  // Обновляем html lang при смене языка — важно для скринридеров и SEO
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TKey) => translations[lang][key];
  const tSpec = (spec: string) => translateSpec(spec, lang);
  return (
    <LangContext.Provider value={{ lang, setLang, t, tSpec }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
