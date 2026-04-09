import { getClinic, getClinics, getSpecializations } from '../../../lib/firebase';
import { ClinicsLayout } from '../../../components/ClinicsLayout';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const clinics = await getClinics().catch(() => []);
  return clinics.slice(0, 50).map((clinic) => ({ id: clinic.id }));
}

export default async function ClinicPage({ params }: Props) {
  const { id } = await params;
  const [selectedClinic, clinics] = await Promise.all([
    getClinic(id).catch(() => null),
    getClinics().catch(() => []),
  ]);

  if (!selectedClinic) notFound();

  const orderedSpecs = await getSpecializations(clinics).catch(() => [] as string[]);

  return (
    <ClinicsLayout
      initialClinics={clinics}
      orderedSpecs={orderedSpecs}
      initialSelectedClinic={selectedClinic}
    />
  );
}
