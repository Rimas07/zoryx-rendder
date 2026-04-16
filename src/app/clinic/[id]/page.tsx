import { getClinic, getClinics, getSpecializations } from '../../../lib/firebase';
import { ClinicsLayout } from '../../../components/ClinicsLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const clinics = await getClinics().catch(() => []);
  return clinics.slice(0, 50).map((clinic) => ({ id: clinic.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const clinic = await getClinic(id).catch(() => null);
  if (!clinic) return {};

  const title = `${clinic.name} — Zoryx`;
  const description = [
    clinic.address,
    clinic.specializations.slice(0, 3).join(', '),
  ].filter(Boolean).join(' · ');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://web.zoryx.app';
  const image = `${baseUrl}/og-image.png`;
  const url = `${baseUrl}/clinic/${clinic.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Zoryx',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: clinic.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
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
