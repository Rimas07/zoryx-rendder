import { getClinics, getSpecializations } from '../lib/firebase';
import { ClinicsLayout } from '../components/ClinicsLayout';


export const dynamic = "force-static";

export default async function HomePage() {
  const clinics = await getClinics().catch(() => []);
  const orderedSpecs = await getSpecializations(clinics).catch(() => []);
  return <ClinicsLayout initialClinics={clinics} orderedSpecs={orderedSpecs} />;
}
