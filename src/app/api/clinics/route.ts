import { getClinics, getSpecializations } from '../../../lib/firebase';

export const revalidate = 300;

export async function GET() {
    const clinics = await getClinics().catch(() => []);
    const orderedSpecs = await getSpecializations(clinics).catch(() => [] as string[]);
    return Response.json({ clinics, orderedSpecs });
}
