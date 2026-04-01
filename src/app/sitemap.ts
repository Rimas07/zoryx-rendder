import { MetadataRoute } from 'next';
import { getClinics } from '../lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const clinics = await getClinics();

    const clinicUrls = clinics.map(clinic => ({
        url: `https://zoryxweb-production.up.railway.app/clinic/${clinic.id}`,
        lastModified: new Date(clinic.updatedAt),
    }));

    return [
        { url: 'https://zoryxweb-production.up.railway.app/' },
        ...clinicUrls,
    ];
}
