import { getClinics, getClinic, getSpecializations } from '../../../lib/firebase';
import { ClinicsLayout } from '../../../components/ClinicsLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const clinic = await getClinic(id).catch(() => null);
  if (!clinic) return {};

  const title = `${clinic.name} — Zoryx`;
  const description = `${clinic.name}, ${clinic.address}. Специализации: ${clinic.specializations.slice(0, 3).join(', ')}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: clinic.logoUrl ? [{ url: clinic.logoUrl }] : [],
    },
  };
}

export default async function ClinicPage({ params }: Props) {
  const { id } = await params;
  const [selectedClinic, clinics, orderedSpecs] = await Promise.all([
    getClinic(id).catch(() => null),
    getClinics().catch(() => []),
    getSpecializations([]).catch(() => [] as string[]),
  ]);

  if (!selectedClinic) notFound();

  return (
    <ClinicsLayout
      initialClinics={clinics}
      orderedSpecs={orderedSpecs}
      initialSelectedClinic={selectedClinic}
    />
  );
}
