import { getClinic, getClinics } from '../../../lib/firebase';
import { notFound } from 'next/navigation';
import { ClinicDetailWrapper } from '../../../components/ClinicDetailWrapper';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const clinics = await getClinics();
  return clinics.map(c => ({ id: c.id }));
}

interface Props {
  params: { id: string };
}

export default async function ClinicPage({ params }: Props) {
  const clinic = await getClinic(params.id).catch(() => null);
  if (!clinic) notFound();
  return <ClinicDetailWrapper clinic={clinic} />;
}
