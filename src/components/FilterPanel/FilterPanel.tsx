'use client';

import { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import './FilterPanel.css';

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
    <div className="filter-backdrop" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-header">
          <button className="filter-back" onClick={onClose}>
            <ChevronLeft size={20} />
          </button>
          <h3>{t("filters")}</h3>
        </div>

        <div className="filter-search">
          <input
            type="text"
            placeholder="поиск специализации..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={15} className="filter-search-icon" />
        </div>

        <div className="filter-body">
          <div className="filter-section-title">{t("specializations")}</div>
          <div className="filter-pills">
            {filtered.map((s) => (
              <button
                key={s}
                className={`filter-pill${
                  selected.includes(s) ? " active" : ""
                }`}
                onClick={() => onToggle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-footer">
          <button className="btn-apply" onClick={onApply}>
            {t("applyFilters")}
          </button>
          <button className="btn-reset" onClick={onReset}>
            {t("resetFilters")}
          </button>
        </div>
      </div>
    </div>
  );
}
