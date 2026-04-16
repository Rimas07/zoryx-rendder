"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useLang } from "../../contexts/LangContext";
import { specTranslations } from "../../i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  specs: string[];
  selected: string[];
  specCounts?: Record<string, number>;
  onToggle: (s: string) => void;
  langs: string[];
  selectedLangs: string[];
  onToggleLang: (l: string) => void;
  districts: string[];
  selectedDistrict: string | null;
  onSelectDistrict: (d: string | null) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

function AccordionSection({
  title,
  badge,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  badge?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-2 text-[13px] font-semibold text-[#1a1535]"
      >
        <span>{title}</span>
        {!!badge && (
          <span className="bg-[#5b4fcf] text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        <ChevronDown
          size={15}
          className={`ml-auto shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pb-2">{children}</div>}
    </div>
  );
}

const PILL_BASE =
  "inline-flex items-center px-[14px] py-[6px] rounded-full text-[12px] font-medium border-[1.5px] transition-colors cursor-pointer font-[inherit]";
const PILL_ACTIVE = "bg-[#5b4fcf] border-[#5b4fcf] text-white";
const PILL_IDLE =
  "bg-[#f0f0f0] border-[#f0f0f0] text-[#6b6690] hover:border-[#5b4fcf] hover:text-[#5b4fcf] hover:bg-[#f0eef8]";

export function FilterPanel({
  specs,
  selected,
  specCounts,
  onToggle,
  langs,
  selectedLangs,
  onToggleLang,
  districts,
  selectedDistrict,
  onSelectDistrict,
  onApply,
  onReset,
  onClose,
}: Props) {
  const { t, tSpec } = useLang();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState({ specs: true, langs: false, districts: false });

  const toggle = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredSpecs = specs.filter((s) => {
    const q = search.toLowerCase();
    if (s.toLowerCase().includes(q)) return true;
    const allTr = specTranslations[s];
    return allTr
      ? Object.values(allTr).some((tr) => tr?.toLowerCase().includes(q))
      : false;
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[480px] w-[90vw]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("filters")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-[#e2dff5] max-h-[65vh] overflow-y-auto pr-1">
          {/* ── Специализации ── */}
          <AccordionSection
            title={t("specializations")}
            badge={selected.length}
            isOpen={open.specs}
            onToggle={() => toggle("specs")}
          >
            <div className="relative pb-2">
              <input
                type="text"
                placeholder={t("searchSpec")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f0eef8] border-[1.5px] border-[#e2dff5] text-[#1a1535] placeholder-[#9d99c0] py-2 pl-3 pr-9 rounded-xl text-[13px] outline-none focus:border-[#5b4fcf] transition-colors"
              />
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9d99c0] pointer-events-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-[28vh] overflow-y-auto">
              {filteredSpecs.map((s) => {
                const isActive = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => onToggle(s)}
                    className={[PILL_BASE, isActive ? PILL_ACTIVE : PILL_IDLE].join(" ")}
                  >
                    {tSpec(s)}
                    {specCounts?.[s] !== undefined && (
                      <span
                        className={[
                          "ml-1.5 text-[11px] rounded-full px-1.5",
                          isActive ? "bg-[#4a3fb8] text-white" : "bg-[#e0e0e0] text-[#6b6690]",
                        ].join(" ")}
                      >
                        {specCounts[s]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </AccordionSection>

          {/* ── Язык врача ── */}
          <AccordionSection
            title={t("filterLanguage")}
            badge={selectedLangs.length}
            isOpen={open.langs}
            onToggle={() => toggle("langs")}
          >
            <div className="flex flex-wrap gap-2">
              {langs.map((l) => {
                const isActive = selectedLangs.includes(l);
                return (
                  <button
                    key={l}
                    onClick={() => onToggleLang(l)}
                    className={[PILL_BASE, isActive ? PILL_ACTIVE : PILL_IDLE].join(" ")}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </AccordionSection>

          {/* ── Район ── */}
          <AccordionSection
            title={t("filterDistrict")}
            badge={selectedDistrict ? 1 : 0}
            isOpen={open.districts}
            onToggle={() => toggle("districts")}
          >
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => {
                const isActive = selectedDistrict === d;
                return (
                  <button
                    key={d}
                    onClick={() => onSelectDistrict(isActive ? null : d)}
                    className={[PILL_BASE, isActive ? PILL_ACTIVE : PILL_IDLE].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </AccordionSection>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReset}>
            {t("resetFilters")}
          </Button>
          <Button onClick={onApply}>{t("applyFilters")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
