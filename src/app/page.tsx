import { getClinics, getSpecializations } from "../lib/firebase";
import { ClinicsLayout } from "../components/ClinicsLayout";

export const revalidate = 300;

export default async function HomePage() {
  const clinics = await getClinics().catch(() => []);
  const orderedSpecs = await getSpecializations(clinics).catch(() => [] as string[]);

  return <ClinicsLayout initialClinics={clinics} orderedSpecs={orderedSpecs} />;
}
