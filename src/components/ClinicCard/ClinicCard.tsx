'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import type { Clinic } from '../../types/clinic';

interface Props {
  clinic: Clinic;
  isActive: boolean;
  activeSpecs: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export function ClinicCard({ clinic, isActive, activeSpecs, isFavorite, onToggleFavorite, onClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const MAX_SPECS = 3;
  const unique = [...new Set(clinic.specializations)];
  const sorted = [
    ...unique.filter((s) => activeSpecs.includes(s)),
    ...unique.filter((s) => !activeSpecs.includes(s)),
  ];
  const visibleSpecs = expanded ? sorted : sorted.slice(0, MAX_SPECS);
  const hiddenCount = Math.max(0, unique.length - MAX_SPECS);

  return (
    <div
      className={[
        'bg-white rounded-2xl p-[14px] cursor-pointer transition-all border-[1.5px]',
        'shadow-[0_2px_12px_rgba(91,79,207,0.08)]',
        'hover:border-[#c5bff0] hover:shadow-[0_4px_20px_rgba(91,79,207,0.15)]',
        isActive ? 'border-[#5b4fcf]' : 'border-transparent',
      ].join(' ')}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="shrink-0 p-[2.5px] rounded-full bg-gradient-to-br from-[#622ADA] to-[#0070BB]">
          <img
            src={clinic.photoUrl || '/Icon clinics.png'}
            alt={clinic.name}
            className="w-[52px] h-[52px] rounded-full object-cover block bg-[#ede9ff]"
          />
        </div>

        {/* Name / badge / address */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[#1a1535] mb-[2px] truncate">
            {clinic.name}
          </div>
          {clinic.isPartner && (
            <img
              src="/Web Zoryx partner.png"
              alt="Zoryx Partner"
              className="h-[26px] w-auto mb-1"
            />
          )}
          {clinic.address && (
            <div className="text-[12px] text-[#6b6690] truncate">{clinic.address}</div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-[6px] shrink-0">
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#3a6fd4] to-[#5b4fcf] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(91,79,207,0.35)] hover:opacity-85 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={15} strokeWidth={2.5} />
            </a>
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

      {/* Specialization tags */}
      {visibleSpecs.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mt-[10px] items-center">
          {visibleSpecs.map((s) => (
            <span
              key={s}
              className={[
                'px-[10px] py-[3px] rounded-full text-[11px] font-medium border-[1.5px] transition-colors',
                activeSpecs.includes(s)
                  ? 'border-[#5b4fcf] text-[#5b4fcf] bg-[#ede9ff]'
                  : 'border-[#e2dff5] text-[#6b6690] bg-transparent',
              ].join(' ')}
            >
              {s.replace(/_/g, ' ')}
            </span>
          ))}
          {!expanded && hiddenCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              className="text-[11px] text-[#9d99c0] hover:text-[#5b4fcf] transition-colors flex items-center gap-0.5"
            >
              +{hiddenCount} <ChevronDown size={12} />
            </button>
          )}
          {expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="text-[11px] text-[#9d99c0] hover:text-[#5b4fcf] transition-colors flex items-center gap-0.5 w-full mt-1"
            >
              <ChevronUp size={12} /> свернуть
            </button>
          )}
        </div>
      )}

      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="flex items-center gap-[5px] mt-2 text-[12px] hover:opacity-80 transition-opacity"
      >
        <Heart
          size={21}
          className={isFavorite ? 'text-[#5b4fcf] fill-[#5b4fcf]' : 'text-[#9d99c0]'}
        />
      </button>
    </div>
  );
}
