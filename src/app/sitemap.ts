import { MetadataRoute } from 'next';
import { getClinics } from '../lib/firebase';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const clinics = await getClinics();

    const clinicUrls = clinics.map(clinic => ({
        url: `https://web.zoryx.app/clinic/${clinic.id}`,
        lastModified: new Date(clinic.updatedAt),
    }));

    return [
        { url: 'https://web.zoryx.app/' },
        ...clinicUrls,
    ];
}
