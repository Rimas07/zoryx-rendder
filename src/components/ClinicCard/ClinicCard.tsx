'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { Phone, MessageCircle, Heart, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { Clinic } from '../../types/clinic';
import { useLang } from '../../contexts/LangContext';
import Image from 'next/image';


interface Props {
  clinic: Clinic;
  isActive: boolean;
  activeSpecs: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  onMapClick: () => void;
}

export function ClinicCard({ clinic, isActive, activeSpecs, isFavorite, onToggleFavorite, onClick, onMapClick }: Props) {
  const { t, tSpec } = useLang();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLButtonElement>(null);

  const MAX_SPECS = 3;
  const unique = [...new Set(clinic.specializations)];
  const sorted = [
    ...unique.filter((s) => activeSpecs.includes(s)),
    ...unique.filter((s) => !activeSpecs.includes(s)),
  ];
  const visibleSpecs = expanded ? sorted : sorted.slice(0, MAX_SPECS);
  const hiddenCount = Math.max(0, unique.length - MAX_SPECS);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -3,
      boxShadow: '0 8px 28px rgba(91,79,207,0.22)',
      duration: 0.22,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 2px 12px rgba(91,79,207,0.08)',
      duration: 0.22,
      ease: 'power2.out',
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
    gsap.fromTo(
      heartRef.current,
      { scale: 0.7 },
      { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
    );
  };

  return (
    <div
      ref={cardRef}
      className={[
        "bg-white rounded-2xl p-[14px] cursor-pointer transition-all border-[1.5px]",
        "shadow-[0_2px_12px_rgba(91,79,207,0.08)]",
        "hover:border-[#c5bff0]",
        isActive ? "border-[#5b4fcf]" : "border-transparent",
      ].join(" ")}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-[2.5px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB]">
          <Image
            src={clinic.photoUrl || "/Icon clinics.png"}
            alt={clinic.name}
            width={52}
            height={52}
            sizes="52px"
            className="rounded-full object-cover block"
            style={{ background: 'linear-gradient(135deg, #ede9ff 0%, #dceeff 100%)' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[#1a1535] mb-[2px] truncate">
            {clinic.name}
          </div>
          {clinic.isPartner && (
            <img
              src="https://gsprqyfmodotiezvopiq.supabase.co/storage/v1/object/public/fdsfds/Web%20Zoryx%20partner.png"
              alt="Zoryx Partner"
              width={104}
              height={26}
              className="h-[26px] w-auto mb-1"
            />
          )}
          {clinic.address && (
            <div className="text-[12px] text-[#6b6690] truncate">
              {clinic.address}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-[6px] shrink-0">
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(91,79,207,0.35)] hover:opacity-85 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={15} strokeWidth={2.5} />
            </a>
          )}
          {clinic.address && (
            <button
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(91,79,207,0.35)] hover:opacity-85 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onMapClick();
              }}
            >
              <MapPin size={15} strokeWidth={2.5} />
            </button>
          )}
          {clinic.altegioCompanyId && (
            <a
              href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`}
              target="_blank"
              rel="noreferrer"
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#6b5dd3] to-[#4a87d8] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(91,79,207,0.35)] hover:opacity-85 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={15} strokeWidth={2.5} />
            </a>
          )}
        </div>
      </div>

      {visibleSpecs.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mt-[10px] items-center">
          {visibleSpecs.map((s) => (
            <span
              key={s}
              className={[
                "px-[10px] py-[3px] rounded-full text-[11px] font-medium border-[1.5px] transition-colors",
                activeSpecs.includes(s)
                  ? "border-[#5b4fcf] text-[#5b4fcf] bg-[#ede9ff]"
                  : "border-[#e2dff5] text-[#6b6690] bg-transparent",
              ].join(" ")}
            >
              {tSpec(s)}
            </span>
          ))}
          {!expanded && hiddenCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              className="px-[10px] py-[3px] rounded-full text-[11px] font-medium border-[1.5px] border-[#c5bff0] text-[#5b4fcf] bg-[#f0eef8] hover:bg-[#ede9ff] hover:border-[#5b4fcf] transition-colors flex items-center gap-0.5"
            >
              +{hiddenCount} <ChevronDown size={12} />
            </button>
          )}
          {expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              className="text-[11px] text-[#9d99c0] hover:text-[#5b4fcf] transition-colors flex items-center gap-0.5 w-full mt-1"
            >
              <ChevronUp size={12} /> {t("collapse")}
            </button>
          )}
        </div>
      )}

      <button
        ref={heartRef}
        onClick={handleFavoriteClick}
        className="flex items-center gap-[5px] mt-2 text-[12px] hover:opacity-80 transition-opacity"
      >
        <Heart
          size={21}
          className={
            isFavorite ? "text-[#5b4fcf] fill-[#5b4fcf]" : "text-[#9d99c0]"
          }
        />
      </button>
    </div>
  );
}
