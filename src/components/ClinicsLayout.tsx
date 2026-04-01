'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const MapView = dynamic(() => import('./MapView/MapView').then(m => m.MapView), { ssr: false });
import { Search, SlidersHorizontal, X, ChevronLeft, Heart } from 'lucide-react';
import { useClinics } from '../hooks/useClinics';
import type { Clinic } from '../types/clinic';
import { useLang } from '../contexts/LangContext';
import { Header } from './Header/Header';
import { FilterPanel } from './FilterPanel/FilterPanel';
import { ClinicCard } from './ClinicCard/ClinicCard';
import { ClinicDetail } from './ClinicDetail/ClinicDetail';
import { WelcomePanel } from './WelcomePanel/WelcomePanel';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialClinics: Clinic[];
  orderedSpecs: string[];
  initialSelectedClinic?: Clinic | null;
}

export function ClinicsLayout({ initialClinics, orderedSpecs, initialSelectedClinic = null }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const { clinics, search, setSearch } = useClinics(initialClinics);
  const clinicSpecSet = new Set(clinics.flatMap(c => c.specializations));
  const allSpecs = orderedSpecs.length > 0
    ? orderedSpecs.filter(s => clinicSpecSet.has(s))
    : Array.from(clinicSpecSet).sort();

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(initialSelectedClinic);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);


  const toggleFavorite = (id: string) =>
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleToggleSpec = (s: string) =>
    setPendingSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleApply = () => { setActiveSpecs(pendingSpecs); setShowFilters(false); };
  const handleReset = () => { setPendingSpecs([]); setActiveSpecs([]); };

  const filtered = activeSpecs.length === 0
    ? clinics
    : clinics.filter(c =>
        activeSpecs.some(s =>
          c.specializations.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
        )
      );

  const displayed = showFavoritesOnly
    ? filtered.filter(c => favorites.has(c.id))
    : filtered;

  return (
    <div className="app">
      <Header
        onLogoClick={() => { setSelectedClinic(null); router.push('/'); }}
        mapVisible={mapVisible}
        onMapToggle={() => setMapVisible((v) => !v)}
      />
      {showFilters && (
        <FilterPanel
          specs={allSpecs}
          selected={pendingSpecs}
          onToggle={handleToggleSpec}
          onApply={handleApply}
          onReset={handleReset}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className={`main-layout${selectedClinic ? " show-detail" : ""}`}>
        {/* ── Left panel ── */}
        <div className="panel-left">
          <div className="search-area">
            <div className="search-row">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={16} className="search-icon" />
              </div>
              <Button
                variant="outline"
                size="icon"
                className={`filter-btn${
                  activeSpecs.length > 0 ? " active" : ""
                }`}
                onClick={() => {
                  setPendingSpecs(activeSpecs);
                  setShowFilters(true);
                }}
              >
                <SlidersHorizontal size={18} />
              </Button>
            </div>
          </div>

          {/* All / Favorites toggle */}
          <div className="flex gap-2 px-[14px] pb-2">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={[
                "px-4 py-[7px] rounded-full text-[13px] font-medium transition-colors border-[1.5px]",
                !showFavoritesOnly
                  ? "bg-[#5b4fcf] border-[#5b4fcf] text-white"
                  : "bg-white border-[#e2dff5] text-[#6b6690] hover:border-[#5b4fcf] hover:text-[#5b4fcf]",
              ].join(" ")}
            >
              {t("allClinics")}
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={[
                "px-4 py-[7px] rounded-full text-[13px] font-medium transition-colors border-[1.5px] flex items-center gap-1.5",
                showFavoritesOnly
                  ? "bg-[#5b4fcf] border-[#5b4fcf] text-white"
                  : "bg-white border-[#e2dff5] text-[#6b6690] hover:border-[#5b4fcf] hover:text-[#5b4fcf]",
              ].join(" ")}
            >
              <Heart
                size={14}
                className={
                  showFavoritesOnly
                    ? "fill-white text-white"
                    : "fill-[#5b4fcf] text-[#5b4fcf]"
                }
              />
              {t("onlyFavorites")}
            </button>
          </div>

          {activeSpecs.length > 0 && (
            <div className="active-filters">
              <div className="active-filters-chips">
                {activeSpecs.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="gap-1 pr-1 cursor-default"
                  >
                    {s}
                    <button
                      className="ml-1 hover:text-[#5b4fcf] transition-colors"
                      onClick={() =>
                        setActiveSpecs((prev) => prev.filter((x) => x !== s))
                      }
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="filters-collapse-btn shrink-0"
                onClick={() => setActiveSpecs([])}
              >
                <ChevronLeft size={18} />
              </Button>
            </div>
          )}

          <div className="clinics-list">
            {displayed.length === 0 && (
              <div className="state-center">
                <div className="state-icon">🔍</div>
                <h4>{t("noResults")}</h4>
                <p>{t("noResultsHint")}</p>
              </div>
            )}
            {displayed.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isActive={selectedClinic?.id === clinic.id}
                activeSpecs={activeSpecs}
                isFavorite={favorites.has(clinic.id)}
                onToggleFavorite={() => toggleFavorite(clinic.id)}
                onClick={() => { setSelectedClinic(clinic); window.history.pushState(null, '', `/k/${clinic.id}`); }}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="panel-right">
          {selectedClinic && mapVisible ? (
            <MapView clinic={selectedClinic} />
          ) : selectedClinic ? (
            <ClinicDetail
              key={selectedClinic.id}
              clinic={selectedClinic}
              onBack={() => setSelectedClinic(null)}
            />
          ) : (
            <WelcomePanel />
          )}
        </div>
      </div>
    </div>
  );
}
