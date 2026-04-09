'use client';

import { useState } from 'react';
import {
  Phone,
  Heart,
  Umbrella,
  Stethoscope,
  BookOpen,
  Mail,
  MapPin,
  Globe,
  ArrowBigLeft,
} from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import { getClinicInfo } from '../../types/clinic';
import type { Clinic } from '../../types/clinic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SafeHtml from "../SafeHtml";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('../MapView/MapView').then(m => ({ default: m.MapView })), { ssr: false });

interface Props {
  clinic: Clinic;
  onBack?: () => void;
}

export function ClinicDetail({ clinic, onBack }: Props) {
  const { t, lang, tSpec } = useLang();
  const infoHtml = getClinicInfo(clinic, lang);
  const [mapOpen, setMapOpen] = useState(false);

  const flags: Record<string, string> = {
    cs: 'https://flagcdn.com/w40/cz.png',
    ru: 'https://flagcdn.com/w40/ru.png',
    uk: 'https://flagcdn.com/w40/ua.png',
    en: 'https://flagcdn.com/w40/gb.png',
  };

  return (
    <div className="w-full p-7">
      {/* ── HERO ── */}
      <div className="relative rounded-[20px] bg-gradient-to-br from-[rgba(110,95,210,0.18)] to-[rgba(70,130,220,0.15)] px-5 pt-6 pb-5 mb-[14px] flex flex-col items-center gap-3 text-center">
        {/* like button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white/90"
        >
          <Heart size={40} className="text-[#5b4fcf] fill-[#5b4fcf]" />
        </Button>
{/* image of clinic */}
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] p-[3px] shadow-[0_6px_20px_rgba(91,79,207,0.25)]">
          <img
            src={clinic.photoUrl || "/Icon clinics.png"}
            alt={clinic.name}
            className="w-full h-full rounded-full object-cover block bg-white"
          />
        </div>
{/* nam of clinc */}
        <div className="text-[20px] font-bold text-[#5b4fcf] flex items-center justify-center gap-1.5 flex-wrap">
          {clinic.name}
        </div>

        {clinic.isPartner && (
          <img
            src="https://gsprqyfmodotiezvopiq.supabase.co/storage/v1/object/public/fdsfds/Web%20Zoryx%20partner.png"
            alt="Zoryx Partner"
            className="h-[28px] w-auto"
          />
        )}
      </div>

      {mapOpen && (
        <div className="rounded-2xl overflow-hidden mb-3 shadow-[0_2px_12px_rgba(91,79,207,0.08)]" style={{ height: 300 }}>
          <MapView clinic={clinic} />
        </div>
      )}

      {/* ── ABOUT ── */}
      <div className="bg-white rounded-2xl px-[18px] py-4 mb-3 shadow-[0_2px_12px_rgba(91,79,207,0.08)]">
        <div className="text-[15px] font-semibold mb-[14px]">
          {t("aboutClinic")}
        </div>

        {clinic.languages.length > 0 && (
          <div className="flex items-center gap-2 mb-[14px] pb-[14px] border-b border-[#e2dff5] text-[13px] text-[#6b6690]">
            <span>{t("weSpeak")}</span>
            <div className="flex items-center gap-1">
              {clinic.languages.map((l) => {
                const code = l.toLowerCase();
                return flags[code] ? (
                  <img
                    key={l}
                    src={flags[code]}
                    alt={l}
                    title={l}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : null;
              })}
            </div>
          </div>
        )}

        {clinic.insurances && (
          <InfoRow
            icon={<Umbrella size={20} strokeWidth={1.8} color="#5b4fcf" />}
          >
            <Label>{t("insurance")}</Label>
            <Value style={{ whiteSpace: "pre-line" }}>
              {clinic.insurances
                .split(",")
                .map((s) => s.trim())
                .join("\n")}
            </Value>
          </InfoRow>
        )}

        {clinic.specializations.length > 0 && (
          <InfoRow
            icon={<Stethoscope size={20} strokeWidth={1.8} color="#5b4fcf" />}
          >
            <Label>{t("specializationsLabel")}</Label>
            <div className="flex flex-wrap gap-[5px] mt-[6px]">
              {clinic.specializations.map((s) => (
                <Badge key={s} variant="secondary">
                  {tSpec(s)}
                </Badge>
              ))}
            </div>
          </InfoRow>
        )}

        {infoHtml && (
          <InfoRow
            icon={<BookOpen size={20} strokeWidth={1.8} color="#5b4fcf" />}
            last
          >
            <Label>{t("additionalInfo")}</Label>
            <SafeHtml
              html={infoHtml}
              className="text-[13px] text-[#6b6690] leading-[1.8]"
            />
          </InfoRow>
        )}
      </div>

      {/* ── CONTACTS ── */}
      <div className="bg-white rounded-2xl px-[18px] py-4 mb-3 shadow-[0_2px_12px_rgba(91,79,207,0.08)]">
        <div className="text-[15px] font-semibold mb-[14px]">
          {t("contacts")}
        </div>

        {clinic.phone && (
          <InfoRow icon={<Phone size={20} strokeWidth={1.8} color="#5b4fcf" />}>
            <Label>{t("phoneNumber")}</Label>
            <a
              href={`tel:${clinic.phone}`}
              className="text-[13px] text-[#5b4fcf] leading-[1.8]"
            >
              {clinic.phone}
            </a>
          </InfoRow>
        )}

        {clinic.email && (
          <InfoRow icon={<Mail size={20} strokeWidth={1.8} color="#5b4fcf" />}>
            <Label>{t("email")}</Label>
            <a
              href={`mailto:${clinic.email}`}
              className="text-[13px] text-[#5b4fcf] leading-[1.8]"
            >
              {clinic.email}
            </a>
          </InfoRow>
        )}

        {clinic.address && (
          <InfoRow
            icon={<MapPin size={20} strokeWidth={1.8} color="#5b4fcf" />}
          >
            <Label>{t("address")}</Label>
            <Value>{clinic.address}</Value>
          </InfoRow>
        )}

        {clinic.website && (
          <InfoRow
            icon={<Globe size={20} strokeWidth={1.8} color="#5b4fcf" />}
            last={!clinic.address}
          >
            <Label>{t("website")}</Label>
            <a
              href={clinic.website}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#5b4fcf] leading-[1.8]"
            >
              {clinic.website}
            </a>
          </InfoRow>
        )}

      </div>

      {clinic.altegioCompanyId && (
        <Button
          asChild
          className="w-full h-auto py-[13px] text-[14px] font-semibold bg-gradient-to-br from-[#5b4fcf] to-[#7b6fe0] hover:opacity-90 transition-opacity rounded-xl mt-1"
        >
          <a
            href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`}
            target="_blank"
            rel="noreferrer"
          >
            {t("bookAppointment")}
          </a>
        </Button>
      )}
    </div>
  );
}

// Small helpers to keep InfoRow clean
function InfoRow({
  icon,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-start gap-[14px] py-3 text-[14px] ${last ? '' : 'border-b border-[#e2dff5]'}`}>
      <div className="shrink-0 mt-[2px]">{icon}</div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-semibold text-[#1a1535] mb-1">{children}</div>;
}

function Value({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="text-[13px] text-[#6b6690] leading-[1.8]" style={style}>{children}</div>;
}
