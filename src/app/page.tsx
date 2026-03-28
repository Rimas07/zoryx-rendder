import { getClinics, getSpecializations } from '../lib/firebase';
import { ClinicsLayout } from '../components/ClinicsLayout';


export const dynamic = "force-static";

export default async function HomePage() {
  const [clinics, orderedSpecs] = await Promise.all([
    getClinics().catch(() => []),
    getSpecializations().catch(() => []),
  ]);
  return <ClinicsLayout initialClinics={clinics} orderedSpecs={orderedSpecs} />;
}
