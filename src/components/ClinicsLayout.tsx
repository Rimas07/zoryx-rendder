"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Search, SlidersHorizontal, X, ChevronLeft, Heart } from "lucide-react";
import { useClinics } from "../hooks/useClinics";
import type { Clinic } from "../types/clinic";
import { useLang } from "../contexts/LangContext";
import { Header } from "./Header/Header";
import { FilterPanel } from "./FilterPanel/FilterPanel";
import { ClinicCard } from "./ClinicCard/ClinicCard";
import { ClinicDetail } from "./ClinicDetail/ClinicDetail";
import { WelcomePanel } from "./WelcomePanel/WelcomePanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const ChatBot = dynamic(
  () => import("./ChatBot/ChatBot").then((m) => m.ChatBot),
  { ssr: false }
);

interface Props {
  initialClinics: Clinic[];
  orderedSpecs: string[];
  initialSelectedClinic?: Clinic | null;
}

export function ClinicsLayout({
  initialClinics,
  orderedSpecs,
  initialSelectedClinic = null,
}: Props) {
  const { t, tSpec } = useLang();

  const { clinics, search, setSearch } = useClinics(initialClinics);
  const clinicSpecSet = new Set(clinics.flatMap((c) => c.specializations));
  const allSpecs =
    orderedSpecs.length > 0
      ? orderedSpecs.filter((s) => clinicSpecSet.has(s))
      : Array.from(clinicSpecSet).sort();
  const specCounts = Object.fromEntries(
    allSpecs.map((s) => [
      s,
      clinics.filter((c) =>
        c.specializations.some((cs) =>
          cs.toLowerCase().includes(s.toLowerCase())
        )
      ).length,
    ])
  );

  // Уникальные языки из всех клиник (не зависят от поиска)
  const allLanguages = [...new Set(initialClinics.flatMap((c) => c.languages))]
    .filter(Boolean)
    .sort();

  // Уникальные районы Праги из адресов
  const allDistricts = [
    ...new Set(
      initialClinics
        .map((c) => {
          const m = c.address.match(/Praha\s*(\d+)/i);
          return m ? `Praha ${m[1]}` : null;
        })
        .filter(Boolean) as string[]
    ),
  ].sort((a, b) => {
    const n = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? "0");
    return n(a) - n(b);
  });

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(
    initialSelectedClinic
  );
  const [showFilters, setShowFilters] = useState(false);

  // Специализации
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);

  // Языки
  const [pendingLangs, setPendingLangs] = useState<string[]>([]);
  const [activeLangs, setActiveLangs] = useState<string[]>([]);

  // Район
  const [pendingDistrict, setPendingDistrict] = useState<string | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zoryx_favorites');
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('zoryx_favorites', JSON.stringify([...next]));
      return next;
    });

  const handleToggleSpec = (s: string) =>
    setPendingSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleToggleLang = (l: string) =>
    setPendingLangs((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const handleApply = () => {
    setActiveSpecs(pendingSpecs);
    setActiveLangs(pendingLangs);
    setActiveDistrict(pendingDistrict);
    setShowFilters(false);
  };

  const handleReset = () => {
    setPendingSpecs([]);
    setActiveSpecs([]);
    setPendingLangs([]);
    setActiveLangs([]);
    setPendingDistrict(null);
    setActiveDistrict(null);
  };

  // Фильтрация по специализации
  const filteredBySpec =
    activeSpecs.length === 0
      ? clinics
      : clinics.filter((c) =>
          activeSpecs.some((s) =>
            c.specializations.some((cs) =>
              cs.toLowerCase().includes(s.toLowerCase())
            )
          )
        );

  // Фильтрация по языку
  const filteredByLang =
    activeLangs.length === 0
      ? filteredBySpec
      : filteredBySpec.filter((c) =>
          activeLangs.some((l) =>
            c.languages.some((cl) => cl.toLowerCase() === l.toLowerCase())
          )
        );

  // Фильтрация по району
  const filtered =
    !activeDistrict
      ? filteredByLang
      : filteredByLang.filter((c) => c.address.includes(activeDistrict));

  const displayed = showFavoritesOnly
    ? filtered.filter((c) => favorites.has(c.id))
    : filtered;

  const hasActiveFilters =
    activeSpecs.length > 0 || activeLangs.length > 0 || !!activeDistrict;

  const [openWithMap, setOpenWithMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const allBtnRef = useRef<HTMLButtonElement>(null);
  const favBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setVisibleCount(20); }, [displayed.length]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!listRef.current) return;
      const cards = listRef.current.querySelectorAll(':scope > div');
      if (cards.length === 0) return;
      gsap.fromTo(cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out", clearProps: "all" }
      );
    });
    return () => cancelAnimationFrame(id);
  }, [displayed.length]);

  useEffect(() => {
    if (!listRef.current) return;
    const cards = Array.from(listRef.current.querySelectorAll(':scope > div'));
    if (cards.length === 0) return;
    const newCards = cards.slice(-20);
    gsap.fromTo(newCards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out", clearProps: "all" }
    );
  }, [visibleCount]);

  useEffect(() => {
    if (!chipsRef.current || !hasActiveFilters) return;
    const chips = chipsRef.current.querySelectorAll(':scope > *');
    gsap.fromTo(chips,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 0.22, stagger: 0.04, ease: 'back.out(2)' }
    );
  }, [activeSpecs.length, activeLangs.length, activeDistrict]);

  const handleToggleFavoritesOnly = (value: boolean) => {
    setShowFavoritesOnly(value);
    const target = value ? favBtnRef.current : allBtnRef.current;
    if (target) gsap.fromTo(target, { scale: 0.88 }, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
  };

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((n) => n + 20);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/clinic/')) {
        setSelectedClinic(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openClinic = (clinic: Clinic, withMap = false) => {
    setOpenWithMap(withMap);
    setSelectedClinic(clinic);
    window.history.pushState(null, '', `/clinic/${clinic.id}`);
  };

  return (
    <div className="app">
      <Header
        onLogoClick={() => {
          setSelectedClinic(null);
          window.history.pushState(null, '', '/');
        }}
      />
      {showFilters && (
        <FilterPanel
          specs={allSpecs}
          selected={pendingSpecs}
          specCounts={specCounts}
          onToggle={handleToggleSpec}
          langs={allLanguages}
          selectedLangs={pendingLangs}
          onToggleLang={handleToggleLang}
          districts={allDistricts}
          selectedDistrict={pendingDistrict}
          onSelectDistrict={setPendingDistrict}
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
                className={`filter-btn${hasActiveFilters ? " active" : ""}`}
                onClick={() => {
                  setPendingSpecs(activeSpecs);
                  setPendingLangs(activeLangs);
                  setPendingDistrict(activeDistrict);
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
              ref={allBtnRef}
              onClick={() => handleToggleFavoritesOnly(false)}
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
              ref={favBtnRef}
              onClick={() => handleToggleFavoritesOnly(true)}
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

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="active-filters">
              <div ref={chipsRef} className="active-filters-chips">
                {activeSpecs.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1 cursor-default">
                    {tSpec(s)}
                    {specCounts[s] !== undefined && (
                      <span className="bg-[#5b4fcf] text-white text-[10px] font-semibold rounded-full px-1.5 py-0 leading-4">
                        {specCounts[s]}
                      </span>
                    )}
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
                {activeLangs.map((l) => (
                  <Badge key={l} variant="secondary" className="gap-1 pr-1 cursor-default">
                    {l}
                    <button
                      className="ml-1 hover:text-[#5b4fcf] transition-colors"
                      onClick={() =>
                        setActiveLangs((prev) => prev.filter((x) => x !== l))
                      }
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
                {activeDistrict && (
                  <Badge variant="secondary" className="gap-1 pr-1 cursor-default">
                    {activeDistrict}
                    <button
                      className="ml-1 hover:text-[#5b4fcf] transition-colors"
                      onClick={() => setActiveDistrict(null)}
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="filters-collapse-btn shrink-0"
                onClick={handleReset}
              >
                <ChevronLeft size={18} />
              </Button>
            </div>
          )}

          <div className="clinics-list" ref={listRef}>
            {displayed.length === 0 && (
              <div className="state-center">
                <div className="state-icon">🔍</div>
                <h4>{t("noResults")}</h4>
                <p>{t("noResultsHint")}</p>
              </div>
            )}
            {displayed.slice(0, visibleCount).map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                isActive={selectedClinic?.id === clinic.id}
                activeSpecs={activeSpecs}
                isFavorite={favorites.has(clinic.id)}
                onToggleFavorite={() => toggleFavorite(clinic.id)}
                onClick={() => openClinic(clinic)}
                onMapClick={() => openClinic(clinic, true)}
              />
            ))}
            <div ref={loaderRef} className="py-2">
              {visibleCount < displayed.length && (
                <p className="text-center text-[13px] text-[#9d99c0]">{t("loading")}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="panel-right">
          {selectedClinic ? (
            <ClinicDetail
              key={selectedClinic.id}
              clinic={selectedClinic}
              initialMapOpen={openWithMap}
              isFavorite={favorites.has(selectedClinic.id)}
              onToggleFavorite={() => toggleFavorite(selectedClinic.id)}
              onBack={() => {
                setSelectedClinic(null);
                window.history.pushState(null, '', '/');
              }}
            />
          ) : (
            <WelcomePanel />
          )}
        </div>
      </div>
      <ChatBot
        specializations={allSpecs}
        activeLangs={activeLangs}
        activeDistrict={activeDistrict}
        onSpecializationSelect={(spec) => {
          setActiveSpecs((prev) => prev.includes(spec) ? prev : [...prev, spec]);
        }}
        onClinicSelect={(id) => {
          const clinic = clinics.find((c) => c.id === id);
          if (clinic) openClinic(clinic);
        }}
      />
    </div>
  );
}
