'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft } from 'lucide-react';
import { useClinics } from '../hooks/useClinics';
import type { Clinic } from '../types/clinic';
import { useLang } from '../contexts/LangContext';
import { Header } from './Header/Header';
import { FilterPanel } from './FilterPanel/FilterPanel';
import { ClinicCard } from './ClinicCard/ClinicCard';
import { ClinicDetail } from './ClinicDetail/ClinicDetail';
import { WelcomePanel } from './WelcomePanel/WelcomePanel';

interface Props {
  initialClinics: Clinic[];
  orderedSpecs: string[];
}

export function ClinicsLayout({ initialClinics, orderedSpecs }: Props) {
  const { t } = useLang();
  const { clinics, search, setSearch } = useClinics(initialClinics);
  const clinicSpecSet = new Set(clinics.flatMap(c => c.specializations));
  const allSpecs = orderedSpecs.length > 0
    ? orderedSpecs.filter(s => clinicSpecSet.has(s))
    : Array.from(clinicSpecSet).sort();

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);

  const handleToggleSpec = (s: string) =>
    setPendingSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleApply = () => { setActiveSpecs(pendingSpecs); setShowFilters(false); };
  const handleReset = () => { setPendingSpecs([]); setActiveSpecs([]); };

  const displayed = activeSpecs.length === 0
    ? clinics
    : clinics.filter(c =>
        activeSpecs.some(s =>
          c.specializations.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
        )
      );

  return (
    <div className="app">
      <Header onLogoClick={() => setSelectedClinic(null)} />
      {showFilters && (
        <FilterPanel
          specs = {allSpecs}
          selected={pendingSpecs}
          onToggle={handleToggleSpec}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className={`main-layout${selectedClinic ? ' show-detail' : ''}`}>

        {/* ── Left panel ── */}
        <div className="panel-left">
          <div className="search-area">
            <div className="search-row">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search size={16} className="search-icon" />
              </div>
              <button
                className={`filter-btn${activeSpecs.length > 0 ? ' active' : ''}`}
                onClick={() => { setPendingSpecs(activeSpecs); setShowFilters(true); }}
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {activeSpecs.length > 0 && (
            <div className="active-filters">
              <div className="active-filters-chips">
                {activeSpecs.map(s => (
                  <div key={s} className="active-filter-pill">
                    {s}
                    <button
                      className="remove-btn"
                      onClick={() => setActiveSpecs(prev => prev.filter(x => x !== s))}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="filters-collapse-btn" onClick={() => setActiveSpecs([])}>
                <ChevronLeft size={18} />
              </button>
            </div>
          )}

          <div className="clinics-list">
            {displayed.length === 0 && (
              <div className="state-center">
                <div className="state-icon">🔍</div>
                <h4>{t('noResults')}</h4>
                <p>{t('noResultsHint')}</p>
              </div>
            )}
            {displayed.map(clinic => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isActive={selectedClinic?.id === clinic.id}
                activeSpecs={activeSpecs}
                onClick={() => setSelectedClinic(clinic)}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="panel-right">
          {selectedClinic
            ? <ClinicDetail key={selectedClinic.id} clinic={selectedClinic} onBack={() => setSelectedClinic(null)} />
            : <WelcomePanel />
          }
        </div>
      </div>
    </div>
  );
}
