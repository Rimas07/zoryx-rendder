import { getClinics } from '../lib/firebase';
import { ClinicsLayout } from '../components/ClinicsLayout';


export const dynamic = "force-static";

export default async function HomePage() {
  const clinics = await getClinics().catch(() => []);
  return <ClinicsLayout initialClinics={clinics} />;
}
