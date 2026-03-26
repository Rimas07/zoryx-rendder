'use client';

import type { Clinic } from '../types/clinic';
import { ClinicDetail } from './ClinicDetail/ClinicDetail';
import { LangProvider } from '../contexts/LangContext';

interface Props {
  clinic: Clinic;
}

export function ClinicDetailWrapper({ clinic }: Props) {
  return (
    <LangProvider>
      <ClinicDetail clinic={clinic} />
    </LangProvider>
  );
}
