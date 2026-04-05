import { permanentRedirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClinicPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/clinic/${id}`);
}
