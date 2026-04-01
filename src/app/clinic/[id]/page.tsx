import { getClinic } from '../../../lib/firebase';
import { notFound } from 'next/navigation';
import { ClinicDetailWrapper } from '../../../components/ClinicDetailWrapper';

interface Props {
  params: { id: string };
}

export default async function ClinicPage({ params }: Props) {
  const clinic = await getClinic(params.id).catch(() => null);
  if (!clinic) notFound();
  return <ClinicDetailWrapper clinic={clinic} />;
}
