'use client';

import { useState, useMemo } from 'react';
import type { Clinic } from '../types/clinic';

export function useClinics(initialClinics: Clinic[]) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [specFilter, setSpecFilter] = useState<string>('all');

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    initialClinics.forEach(c => c.languages.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [initialClinics]);

  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    initialClinics.forEach(c => c.specializations.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [initialClinics]);

  const filtered = useMemo(() => {
    return initialClinics.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.specializations.some(s => s.toLowerCase().includes(q));

      const matchLang = langFilter === 'all' || c.languages.includes(langFilter);
      const matchSpec = specFilter === 'all' || c.specializations.includes(specFilter);

      return matchSearch && matchLang && matchSpec;
    });
  }, [initialClinics, search, langFilter, specFilter]);

  return {
    clinics: filtered,
    search, setSearch,
    langFilter, setLangFilter,
    specFilter, setSpecFilter,
    allLanguages,
    allSpecializations,
  };
}
