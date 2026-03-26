import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft } from 'lucide-react';
import { useClinics } from './hooks/useClinics';
import { getClinic } from './lib/firebase';
import type { Clinic } from './types/clinic';
import { LangProvider, useLang } from './contexts/LangContext';
import { Header } from './components/Header/Header';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { ClinicCard } from './components/ClinicCard/ClinicCard';
import { ClinicDetail } from './components/ClinicDetail/ClinicDetail';
import { WelcomePanel } from './components/WelcomePanel/WelcomePanel';
import './index.css';

function AppInner() {
  const { t } = useLang();
  const { clinics, loading, error, search, setSearch } = useClinics();

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);

  const handleToggleSpec = (s: string) =>
    setPendingSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleApply = () => { setActiveSpecs(pendingSpecs); setShowFilters(false); };
  const handleReset = () => { setPendingSpecs([]); setActiveSpecs([]); };

  const handleSelectClinic = async (clinic: Clinic) => {
    if (!clinic.info) {
      const full = await getClinic(clinic.id);
      setSelectedClinic(full || clinic);
    } else {
      setSelectedClinic(clinic);
    }
  };

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
          selected={pendingSpecs}
          onToggle={handleToggleSpec}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className="main-layout">

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
            {loading && (
              <div className="state-center">
                <div className="spinner" />
                <p>{t('loading')}</p>
              </div>
            )}
            {error && (
              <div className="state-center">
                <p style={{ color: '#e24b4a' }}>{t('failedToLoad')} {error}</p>
              </div>
            )}
            {!loading && displayed.length === 0 && (
              <div className="state-center">
                <div className="state-icon">🔍</div>
                <h4>{t('noResults')}</h4>
                <p>{t('noResultsHint')}</p>
              </div>
            )}
            {!loading && displayed.map(clinic => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isActive={selectedClinic?.id === clinic.id}
                activeSpecs={activeSpecs}
                onClick={() => handleSelectClinic(clinic)}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="panel-right">
          {selectedClinic
            ? <ClinicDetail key={selectedClinic.id} clinic={selectedClinic} />
            : <WelcomePanel />
          }
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
