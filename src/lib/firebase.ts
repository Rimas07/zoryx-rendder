import {
  getFirestore, collection, doc,
  getDocs, getDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import type { Clinic } from '../types/clinic';
import { app } from './firebase-app';

export const db = getFirestore(app);

function docToClinic(id: string, data: Record<string, unknown>): Clinic {
  let updatedAt = '';
  if (data.updatedAt instanceof Timestamp) {
    updatedAt = data.updatedAt.toDate().toLocaleDateString('en-US');
  } else if (typeof data.updatedAt === 'string') {
    updatedAt = data.updatedAt;
  }

  return {
    id,
    name: (data.fullName || data.name) as string || id,
    address: (data.address as string) || '',
    phone: (data.phone as string) || '',
    email: (data.email as string) || '',
    website: data.website as string | undefined,
    photoUrl: (data.photoUrl || data.logoUrl) as string | undefined,
    rank: (data.rank as number) || 0,
    languages: (data.languages as string[]) || [],
    specializations: (data.specializationsList || data.specializations || []) as string[],
    insurances: data.insurances as string | undefined,
    updatedAt,
    altegioCompanyId: data.altegioCompanyId as string | undefined,
    isPartner: (data.isPartner as boolean) || false,
    info: data.info as Record<string, string> | undefined,
  };
}

let _clinicsCache: Clinic[] | null = null;
let _specsCache: string[] | null = null;
let _clinicsCacheTime = 0;
let _specsCacheTime = 0;
const CACHE_TTL = 300_000;

export async function getClinics(): Promise<Clinic[]> {
  if (_clinicsCache && Date.now() - _clinicsCacheTime < CACHE_TTL) return _clinicsCache;
  const q = query(collection(db, 'clinics'), orderBy('rank', 'asc'));
  const snapshot = await getDocs(q);
  _clinicsCache = snapshot.docs.map(d => docToClinic(d.id, d.data() as Record<string, unknown>));
  _clinicsCacheTime = Date.now();
  return _clinicsCache;
}

export async function getSpecializations(clinics?: Clinic[]): Promise<string[]> {
  if (_specsCache && Date.now() - _specsCacheTime < CACHE_TTL) return _specsCache;
  try {
    const q = query(collection(db, 'specializations'), orderBy('rank', 'asc'));
    const snapshot = await getDocs(q);
    _specsCache = snapshot.docs.map(d => d.id);
    _specsCacheTime = Date.now();
    return _specsCache;
  } catch {
    if (clinics && clinics.length > 0) {
      const all = clinics.flatMap(c => c.specializations ?? []);
      return [...new Set(all)].sort();
    }
    return [];
  }
}

export async function getClinic(id: string): Promise<Clinic | null> {
  const ref = doc(db, 'clinics', id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return docToClinic(snapshot.id, snapshot.data() as Record<string, unknown>);
}
