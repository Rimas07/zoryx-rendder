import { getClinic } from '../../../lib/firebase';
import { notFound } from 'next/navigation';
import { ClinicDetailWrapper } from '../../../components/ClinicDetailWrapper';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClinicPage({ params }: Props) {
  const { id } = await params;
  const clinic = await getClinic(id).catch(() => null);
  if (!clinic) notFound();
  return <ClinicDetailWrapper clinic={clinic} />;
}
