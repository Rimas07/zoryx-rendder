import { getClinics } from '../lib/firebase';
import { ClinicsLayout } from '../components/ClinicsLayout';

// Force SSR — не генерировать статически при билде
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const clinics = await getClinics().catch(() => []);
  return <ClinicsLayout initialClinics={clinics} />;
}
