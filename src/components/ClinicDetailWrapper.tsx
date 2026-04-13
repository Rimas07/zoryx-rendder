'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Clinic } from '../types/clinic';
import { ClinicDetail } from './ClinicDetail/ClinicDetail';
import { LangProvider } from '../contexts/LangContext';

interface Props {
  clinic: Clinic;
}

export function ClinicDetailWrapper({ clinic }: Props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zoryx_favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(clinic.id) ? next.delete(clinic.id) : next.add(clinic.id);
      try { localStorage.setItem('zoryx_favorites', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return (
    <LangProvider>
      <ClinicDetail
        clinic={clinic}
        onBack={() => router.push('/')}
        isFavorite={favorites.has(clinic.id)}
        onToggleFavorite={toggleFavorite}
      />
    </LangProvider>
  );
}
