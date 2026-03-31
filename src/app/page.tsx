import { getClinics, getSpecializations } from '../lib/firebase';
import { ClinicsLayout } from '../components/ClinicsLayout';


export const dynamic = "force-static";

export default async function HomePage() {
  const [clinics, orderedSpecs] = await Promise.all([
    getClinics().catch(() => []),
    getSpecializations([]).catch(() => [] as string[]),
    new Promise<void>(resolve => setTimeout(resolve, 4000)),
  ] as const).then(([c, s]) => [c, s] as const);
  return <ClinicsLayout initialClinics={clinics} orderedSpecs={orderedSpecs} />;
}
