'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface A11ySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorblind: boolean;
}

const defaults: A11ySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  colorblind: false,
};

const A11yContext = createContext<{
  settings: A11ySettings;
  toggle: (key: keyof A11ySettings) => void;
}>({ settings: defaults, toggle: () => {} });

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(defaults);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zoryx_a11y');
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
  }, []);

  // Apply classes to <html> and save
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('a11y-high-contrast', settings.highContrast);
    html.classList.toggle('a11y-large-text', settings.largeText);
    html.classList.toggle('a11y-reduced-motion', settings.reducedMotion);
    html.classList.toggle('a11y-colorblind', settings.colorblind);
    localStorage.setItem('zoryx_a11y', JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof A11ySettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <A11yContext.Provider value={{ settings, toggle }}>
      {children}
    </A11yContext.Provider>
  );
}

export const useA11y = () => useContext(A11yContext);
