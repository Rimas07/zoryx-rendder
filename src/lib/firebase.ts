import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, doc,
  getDocs, getDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import type { Clinic } from '../types/clinic';
import { MOCK_CLINICS } from './mockData';

// podklucheniya k fb (env)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};



/* конвертация  данных с ФАЙЕРБЕЙЗ ПРИМЕР

{
  "fullName": "Canadian Medical Care",
  "address": "Veleslavínská 1, Praha 6",
  "updatedAt": Timestamp(seconds=1735689600),
  "rank": 95,
  "specializationsList": ["Cardiology", "Gynaecology"]
  =====>
  {
  "id": "canadian-medical",
  "name": "Canadian Medical Care",
  "address": "Veleslavínská 1, Praha 6",
  "updatedAt": "1/1/2025",
  "rank": 95,
  "specializations": ["Cardiology", "Gynaecology"]
}
}

*/
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);// otkrit soedineniya
export const db = getFirestore(app); // connect to db

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

// ПОЛУЧЕНИЕ ДАННЫЗХ С ФАЙЕРБЕЙЗ  
export async function getClinics(): Promise<Clinic[]> {
  try {
    const q = query(collection(db, 'clinics'), orderBy('rank', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToClinic(d.id, d.data() as Record<string, unknown>));
  } catch (e) {
    console.warn('Firestore unavailable, using mock data:', e);
    return MOCK_CLINICS.slice().sort((a, b) => a.rank - b.rank);
  }
}



export async function getSpecializations(clinics?: Clinic[]): Promise<string[]> {
  try {
    const q = query(collection(db, 'specializations'), orderBy('rank', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.id);
  } catch (e) {
    console.warn('Could not fetch specializations:', e);
    if (clinics && clinics.length > 0) {
      const all = clinics.flatMap(c => c.specializations ?? []);
      return [...new Set(all)].sort();
    }
    return [];
  }
}

// TOJE SAMOE
export async function getClinic(id: string): Promise<Clinic | null> {
  try {
    const ref = doc(db, 'clinics', id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToClinic(snapshot.id, snapshot.data() as Record<string, unknown>);
  } catch (e) {
    console.warn('Firestore unavailable, using mock data:', e);
    return MOCK_CLINICS.find(c => c.id === id) ?? null;
  }
}
