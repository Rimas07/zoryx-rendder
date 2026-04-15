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

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(
    initialSelectedClinic
  );
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);
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

  const handleApply = () => {
    setActiveSpecs(pendingSpecs);
    setShowFilters(false);
  };
  const handleReset = () => {
    setPendingSpecs([]);
    setActiveSpecs([]);
  };

  const filtered =
    activeSpecs.length === 0
      ? clinics
      : clinics.filter((c) =>
          activeSpecs.some((s) =>
            c.specializations.some((cs) =>
              cs.toLowerCase().includes(s.toLowerCase())
            )
          )
        );

  const displayed = showFavoritesOnly
    ? filtered.filter((c) => favorites.has(c.id))
    : filtered;

  const [openWithMap, setOpenWithMap] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const allBtnRef = useRef<HTMLButtonElement>(null);
  const favBtnRef = useRef<HTMLButtonElement>(null);

  // Сбрасываем счётчик при изменении фильтров/поиска
  useEffect(() => { setVisibleCount(20); }, [displayed.length]);

  // Анимация при смене фильтра/поиска — все карточки
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

  // Анимация при подгрузке следующей порции — только новые карточки
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

  // Анимация chips при появлении фильтров
  useEffect(() => {
    if (!chipsRef.current || activeSpecs.length === 0) return;
    const chips = chipsRef.current.querySelectorAll(':scope > *');
    gsap.fromTo(chips,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 0.22, stagger: 0.04, ease: 'back.out(2)' }
    );
  }, [activeSpecs.length]);

  // Tap-анимация на кнопках All / Избранное
  const handleToggleFavoritesOnly = (value: boolean) => {
    setShowFavoritesOnly(value);
    const target = value ? favBtnRef.current : allBtnRef.current;
    if (target) gsap.fromTo(target, { scale: 0.88 }, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
  };

  // Подгружаем ещё 20 когда пользователь доскроллил до низа
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((n) => n + 20);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Слушаем кнопку "назад" в браузере
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

          {activeSpecs.length > 0 && (
            <div className="active-filters">
              <div ref={chipsRef} className="active-filters-chips">
                {activeSpecs.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="gap-1 pr-1 cursor-default"
                  >
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
        clinics={initialClinics.map((c) => ({
          id: c.id,
          name: c.name,
          specializations: c.specializations,
          languages: c.languages,
          address: c.address,
        }))}
        onSpecializationSelect={(spec) => {
          setActiveSpecs((prev) => prev.includes(spec) ? prev : [...prev, spec]);
        }}
        onClinicSelect={(id) => {
          const clinic = clinics.find((c) => c.id === id);
          if (clinic) {
            openClinic(clinic);
          }
        }}
      />
    </div>
  );
}
