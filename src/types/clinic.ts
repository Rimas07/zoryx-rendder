export interface ClinicInfo {
  en?: string;
  cs?: string;
  ru?: string;
  uk?: string;
  [lang: string]: string | undefined;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  photoUrl?: string;
  logoUrl?: string;
  rank: number;
  languages: string[];
  specializations: string[];  
  insurances?: string;
  updatedAt: string;
  altegioCompanyId?: string;
  info?: ClinicInfo;          
}

export function getClinicInfo(clinic: Clinic, lang: string): string {
  if (clinic.info?.[lang]) return clinic.info[lang]!;
  if (clinic.info?.en) return clinic.info.en;
  return '';
}
