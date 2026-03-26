import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc,
  getDocs, getDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import type { Clinic } from '../types/clinic';
import { MOCK_CLINICS } from './mockData';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
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
    info: data.info as Record<string, string> | undefined,
  };
}

export async function getClinics(): Promise<Clinic[]> {
  try {
    const q = query(collection(db, 'clinics'), orderBy('rank', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToClinic(d.id, d.data() as Record<string, unknown>));
  } catch (e) {
    console.warn('Firestore unavailable, using mock data:', e);
    return MOCK_CLINICS.sort((a, b) => b.rank - a.rank);
  }
}

export async function getClinic(id: string): Promise<Clinic | null> {
  try {
    const ref = doc(db, 'clinics', id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToClinic(snapshot.id, snapshot.data() as Record<string, unknown>);
  } catch (e) {
    return MOCK_CLINICS.find(c => c.id === id) || null;
  }
}
