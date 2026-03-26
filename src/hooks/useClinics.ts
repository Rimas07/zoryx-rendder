import { useState, useEffect, useMemo } from 'react';
import { getClinics } from '../lib/firebase';
import type { Clinic } from '../types/clinic';

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [specFilter, setSpecFilter] = useState<string>('all');

  useEffect(() => {
    getClinics()
      .then(setClinics)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    clinics.forEach(c => c.languages.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, [clinics]);

  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    clinics.forEach(c => c.specializations.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [clinics]);

  const filtered = useMemo(() => {
    return clinics.filter(c => {
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
  }, [clinics, search, langFilter, specFilter]);

  return {
    clinics: filtered,
    loading,
    error,
    search, setSearch,
    langFilter, setLangFilter,
    specFilter, setSpecFilter,
    allLanguages,
    allSpecializations,
  };
}
