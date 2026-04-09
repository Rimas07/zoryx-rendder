'use client';

import { useRouter } from 'next/navigation';
import type { Clinic } from '../types/clinic';
import { ClinicDetail } from './ClinicDetail/ClinicDetail';
import { LangProvider } from '../contexts/LangContext';

interface Props {
  clinic: Clinic;
}

export function ClinicDetailWrapper({ clinic }: Props) {
  const router = useRouter();
  return (
    <LangProvider>
      <ClinicDetail clinic={clinic} onBack={() => router.push('/')} />
    </LangProvider>
  );
}
