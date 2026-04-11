'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
import Image from "next/image";

const MapView = dynamic(() => import('../MapView/MapView').then(m => ({ default: m.MapView })), { ssr: false });

interface Props {
  clinic: Clinic;
  onBack?: () => void;
  initialMapOpen?: boolean;
}

export function ClinicDetail({ clinic, onBack, initialMapOpen = false }: Props) {
  const { t, lang, tSpec } = useLang();
  const infoHtml = getClinicInfo(clinic, lang);
  const [mapOpen, setMapOpen] = useState(initialMapOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const partnerRef = useRef<HTMLImageElement>(null);
  const flagsRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const bookBtnRef = useRef<HTMLDivElement>(null);

  // Blocks appear in sequence
  useEffect(() => {
    if (!contentRef.current) return;
    const blocks = contentRef.current.querySelectorAll(':scope > *');
    gsap.fromTo(
      blocks,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
    );
  }, [clinic.id]);

  // Partner badge pulse
  useEffect(() => {
    if (!partnerRef.current || !clinic.isPartner) return;
    const tween = gsap.to(partnerRef.current, {
      filter: 'drop-shadow(0 0 6px rgba(98,42,218,0.7)) drop-shadow(0 0 12px rgba(0,112,187,0.5))',
      scale: 1.06,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => { tween.kill(); };
  }, [clinic.id, clinic.isPartner]);

  // Flags pop in with stagger
  useEffect(() => {
    if (!flagsRef.current) return;
    const items = flagsRef.current.querySelectorAll(':scope > div');
    if (items.length === 0) return;
    gsap.fromTo(items,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.07, ease: 'back.out(2)', delay: 0.35 }
    );
  }, [clinic.id]);

  // Spec badges pop in with stagger
  useEffect(() => {
    if (!specsRef.current) return;
    const badges = specsRef.current.querySelectorAll(':scope > *');
    if (badges.length === 0) return;
    gsap.fromTo(badges,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.25, stagger: 0.04, ease: 'back.out(2)', delay: 0.5 }
    );
  }, [clinic.id]);

  // Book button gentle pulse
  useEffect(() => {
    if (!bookBtnRef.current || !clinic.altegioCompanyId) return;
    const tween = gsap.to(bookBtnRef.current, {
      scale: 1.025,
      duration: 1.0,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => { tween.kill(); gsap.set(bookBtnRef.current, { scale: 1 }); };
  }, [clinic.id, clinic.altegioCompanyId]);

  const flags: Record<string, string> = {
    cs: 'https://flagcdn.com/w40/cz.png',
    ru: 'https://flagcdn.com/w40/ru.png',
    uk: 'https://flagcdn.com/w40/ua.png',
    en: 'https://flagcdn.com/w40/gb.png',
  };

  return (
    <div className="w-full h-full overflow-hidden relative">

      {/* ── FRONT — инфо ── */}
      <div
        style={{
          transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          transform: mapOpen ? "translateX(-100%)" : "translateX(0)",
          position: "absolute",
          inset: 0,
          overflowY: "auto",
        }}
      >
        <div className="w-full p-7" ref={contentRef}>
          {/* Back to list — mobile only */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[#5b4fcf] text-[13px] font-medium mb-3 hover:opacity-75 transition-opacity md:hidden"
            >
              <ArrowBigLeft size={18} />
              {t("allClinics")}
            </button>
          )}

          {/* HERO */}
          <div className="relative rounded-[20px] bg-gradient-to-br from-[rgba(110,95,210,0.18)] to-[rgba(70,130,220,0.15)] px-5 pt-6 pb-5 mb-[14px] flex flex-col items-center gap-3 text-center">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white/90">
              <Heart size={40} className="text-[#5b4fcf] fill-[#5b4fcf]" />
            </Button>
            <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] p-[3px] shadow-[0_6px_20px_rgba(91,79,207,0.25)]">
              <Image
                src={clinic.photoUrl || "/Icon clinics.png"}
                alt={clinic.name}
                width={120}
                height={120}
                sizes="120px"
                priority
                className="rounded-full object-cover block bg-white"
              />
            </div>
            <div className="text-[20px] font-bold text-[#5b4fcf] flex items-center justify-center gap-1.5 flex-wrap">
              {clinic.name}
            </div>
            {clinic.isPartner && (
              <img
                ref={partnerRef}
                src="https://gsprqyfmodotiezvopiq.supabase.co/storage/v1/object/public/fdsfds/Web%20Zoryx%20partner.png"
                alt="Zoryx Partner"
                width={112}
                height={28}
                className="h-[28px] w-auto"
              />
            )}
            <div className="flex gap-2.5">
              {clinic.phone && (
                <Button asChild className="rounded-[22px] px-5 h-11 bg-gradient-to-br from-[#0070BB] to-[#622ADA] hover:opacity-85 transition-opacity shadow-[0_4px_12px_rgba(30,40,80,0.3)]">
                  <a href={`tel:${clinic.phone}`}><Phone size={18} strokeWidth={2.5} /></a>
                </Button>
              )}
              {clinic.address && (
                <Button
                  onClick={() => setMapOpen(true)}
                  className="rounded-[22px] px-5 h-11 bg-gradient-to-br from-[#0070BB] to-[#622ADA] hover:opacity-85 transition-opacity shadow-[0_4px_12px_rgba(30,40,80,0.3)]"
                >
                  <MapPin size={18} strokeWidth={2.5} />
                </Button>
              )}
            </div>
          </div>

          {/* ── ABOUT ── */}
          <div className="bg-white rounded-2xl px-[18px] py-4 mb-3 shadow-[0_2px_12px_rgba(91,79,207,0.08)]">
            <div className="text-[15px] font-semibold mb-[14px]">{t("aboutClinic")}</div>
            {clinic.languages.length > 0 && (
              <div className="flex items-center gap-2 mb-[14px] pb-[14px] border-b border-[#e2dff5] text-[13px] text-[#6b6690]">
                <span>{t("weSpeak")}</span>
                <div ref={flagsRef} className="flex items-center gap-1">
                  {clinic.languages.map((l) => {
                    const code = l.toLowerCase();
                    return flags[code] ? (
                      <div key={l} title={l} className="relative rounded-full overflow-hidden shrink-0" style={{ width: 35, height: 35 }}>
                        <Image src={flags[code]} alt={l} fill style={{ objectFit: 'cover' }} sizes="28px" />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {clinic.insurances && (
              <InfoRow icon={<Umbrella size={20} strokeWidth={1.8} color="#5b4fcf" />}>
                <Label>{t("insurance")}</Label>
                <Value style={{ whiteSpace: "pre-line" }}>
                  {clinic.insurances.split(",").map((s) => s.trim()).join("\n")}
                </Value>
              </InfoRow>
            )}
            {clinic.specializations.length > 0 && (
              <InfoRow icon={<Stethoscope size={20} strokeWidth={1.8} color="#5b4fcf" />}>
                <Label>{t("specializationsLabel")}</Label>
                <div ref={specsRef} className="flex flex-wrap gap-[5px] mt-[6px]">
                  {clinic.specializations.map((s) => (
                    <Badge key={s} variant="secondary">{tSpec(s)}</Badge>
                  ))}
                </div>
              </InfoRow>
            )}
            {infoHtml && (
              <InfoRow icon={<BookOpen size={20} strokeWidth={1.8} color="#5b4fcf" />} last>
                <Label>{t("additionalInfo")}</Label>
                <SafeHtml html={infoHtml} className="text-[13px] text-[#6b6690] leading-[1.8]" />
              </InfoRow>
            )}
          </div>

          {/* ── CONTACTS ── */}
          <div className="bg-white rounded-2xl px-[18px] py-4 mb-3 shadow-[0_2px_12px_rgba(91,79,207,0.08)]">
            <div className="text-[15px] font-semibold mb-[14px]">{t("contacts")}</div>
            {clinic.phone && (
              <InfoRow icon={<Phone size={20} strokeWidth={1.8} color="#5b4fcf" />}>
                <Label>{t("phoneNumber")}</Label>
                <a href={`tel:${clinic.phone}`} className="text-[13px] text-[#5b4fcf] leading-[1.8]">{clinic.phone}</a>
              </InfoRow>
            )}
            {clinic.email && (
              <InfoRow icon={<Mail size={20} strokeWidth={1.8} color="#5b4fcf" />}>
                <Label>{t("email")}</Label>
                <a href={`mailto:${clinic.email}`} className="text-[13px] text-[#5b4fcf] leading-[1.8] break-all">{clinic.email}</a>
              </InfoRow>
            )}
            {clinic.address && (
              <InfoRow icon={<MapPin size={20} strokeWidth={1.8} color="#5b4fcf" />}>
                <Label>{t("address")}</Label>
                <Value>{clinic.address}</Value>
              </InfoRow>
            )}
            {clinic.website && /^https?:\/\//.test(clinic.website) && (
              <InfoRow icon={<Globe size={20} strokeWidth={1.8} color="#5b4fcf" />} last>
                <Label>{t("website")}</Label>
                <a href={clinic.website} target="_blank" rel="noreferrer noopener" className="text-[13px] text-[#5b4fcf] leading-[1.8] break-all">
                  {clinic.website}
                </a>
              </InfoRow>
            )}
          </div>

          {clinic.altegioCompanyId && (
            <div ref={bookBtnRef}>
              <Button asChild className="w-full h-auto py-[13px] text-[14px] font-semibold bg-gradient-to-br from-[#5b4fcf] to-[#7b6fe0] hover:opacity-90 transition-opacity rounded-xl mt-1">
                <a href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`} target="_blank" rel="noreferrer">
                  {t("bookAppointment")}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── BACK — карта ── */}
      <div
        style={{
          transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          transform: mapOpen ? "translateX(0)" : "translateX(100%)",
          position: "absolute",
          inset: 0,
        }}
      >
        <div className="relative w-full h-full" style={{ minHeight: 400 }}>
          {mapOpen && <MapView clinic={clinic} />}
          <button
            onClick={() => setMapOpen(false)}
            className="absolute top-4 left-4 z-[1000] flex items-center gap-1.5 bg-white text-[#5b4fcf] text-[13px] font-semibold px-3 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:opacity-85 transition-opacity"
          >
            <ArrowBigLeft size={18} />
            {t("aboutClinic")}
          </button>
        </div>
      </div>

    </div>
  );
}

function InfoRow({ icon, children, last = false }: { icon: React.ReactNode; children: React.ReactNode; last?: boolean }) {
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
