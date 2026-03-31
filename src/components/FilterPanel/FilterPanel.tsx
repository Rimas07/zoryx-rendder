"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useLang } from "../../contexts/LangContext";
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
  onToggle: (s: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function FilterPanel({
  specs,
  selected,
  onToggle,
  onApply,
  onReset,
  onClose,
}: Props) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const filtered = specs.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[480px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>{t("filters")}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative px-0 pb-2">
          <input
            type="text"
            placeholder="поиск специализации..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f0eef8] border-[1.5px] border-[#e2dff5] text-[#1a1535] placeholder-[#9d99c0] py-2 pl-3 pr-9 rounded-xl text-[13px] outline-none focus:border-[#5b4fcf] transition-colors"
          />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9d99c0] pointer-events-none" />
        </div>

        {/* Section title */}
        <div className="text-[13px] font-semibold text-[#1a1535]">{t("specializations")}</div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto">
          {filtered.map((s) => {
            const isActive = selected.includes(s);
            return (
              <button
                key={s}
                onClick={() => onToggle(s)}
                className={[
                  "inline-flex items-center px-[14px] py-[6px] rounded-full text-[12px] font-medium border-[1.5px] transition-colors cursor-pointer font-[inherit]",
                  isActive
                    ? "bg-[#5b4fcf] border-[#5b4fcf] text-white"
                    : "bg-transparent border-[#e2dff5] text-[#6b6690] hover:border-[#5b4fcf] hover:text-[#5b4fcf]",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
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
