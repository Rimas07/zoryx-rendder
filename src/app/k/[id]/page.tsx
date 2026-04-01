import { getClinics, getClinic, getSpecializations } from '../../../lib/firebase';
import { ClinicsLayout } from '../../../components/ClinicsLayout';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
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
