'use client';

import { Phone, MessageCircle, Heart } from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import type { Clinic } from '../../types/clinic';
import './ClinicCard.css';

interface Props {
  clinic: Clinic;
  isActive: boolean;
  activeSpecs: string[];
  onClick: () => void;
}

export function ClinicCard({ clinic, isActive, activeSpecs, onClick }: Props) {
  const { t } = useLang();
  const MAX_SPECS = 3;
  const sorted = [
    ...clinic.specializations.filter((s) => activeSpecs.includes(s)),
    ...clinic.specializations.filter((s) => !activeSpecs.includes(s)),
  ];
  const visibleSpecs = sorted.slice(0, MAX_SPECS);
  const hiddenCount = Math.max(0, clinic.specializations.length - MAX_SPECS);

  return (
    <div className={`clinic-card${isActive ? ' active' : ''}`} onClick={onClick}>
      <div className="card-top">
        <div className="logo-ring">
          <img
            src={clinic.photoUrl || '/Icon clinics.png'}
            alt={clinic.name}
            className="clinic-logo"
          />
        </div>
        <div className="card-info-main">
          <div className="card-name">{clinic.name}</div>
          {clinic.altegioCompanyId && (
            <div className="partner-badge">{t('zoryxPartner')}</div>
          )}
          {clinic.address && <div className="card-address">{clinic.address}</div>}
        </div>
        <div className="card-actions">
          {clinic.phone && (
            <a href={`tel:${clinic.phone}`} className="action-btn" onClick={e => e.stopPropagation()}>
              <Phone size={15} strokeWidth={2.5} />
            </a>
          )}
          {clinic.altegioCompanyId && (
            <a
              href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`}
              target="_blank" rel="noreferrer"
              className="action-btn action-btn--chat"
              onClick={e => e.stopPropagation()}
            >
              <MessageCircle size={15} strokeWidth={2.5} />
            </a>
          )}
        </div>
      </div>

      {visibleSpecs.length > 0 && (
        <div className="card-specs">
          {visibleSpecs.map(s => (
            <span key={s} className={`spec-tag${activeSpecs.includes(s) ? ' highlighted' : ''}`}>
              {s.replace(/_/g, ' ')}
            </span>
          ))}
          {hiddenCount > 0 && <span className="more-specs">+{hiddenCount}</span>}
        </div>
      )}

      <div className="card-likes">
        <Heart size={13} className={isActive ? 'heart-filled' : 'heart-empty'} />
        <span>{Math.abs(clinic.rank)} {t('ratings')}</span>
      </div>
    </div>
  );
}
