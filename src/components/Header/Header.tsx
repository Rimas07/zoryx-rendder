'use client';

import { useLang } from '../../contexts/LangContext';
import type { Lang } from '../../i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANG_LABELS: Record<Lang, string> = { cs: 'CS', ru: 'RU', uk: 'UK', en: 'EN' };

interface Props {
  onLogoClick: () => void;
  mapVisible: boolean;
  onMapToggle: () => void;
}

export function Header({ onLogoClick, mapVisible, onMapToggle }: Props) {
  const { lang, setLang } = useLang();

  return (
    <header className="bg-gradient-to-r from-[#622ADA] to-[#0070BB] h-[60px] px-5 flex items-center justify-between gap-4 z-[200] shrink-0 max-sm:px-3 max-sm:gap-2">
      {/* Logo */}
      <div
        className="flex items-center gap-2 shrink-0 cursor-pointer"
        onClick={onLogoClick}
      >
        <img
          src="/ZORYX LOGO .png"
          alt="Zoryx Logo"
          className="h-[42px] w-auto max-sm:h-8"
        />
        <span className="text-[22px] font-bold text-white tracking-[-0.3px] max-sm:text-[18px]">
          Zoryx
        </span>
      </div>

      {/* Center — Show on map */}
      <div
        className="flex items-center gap-3 text-white text-[14px] font-medium select-none max-sm:hidden cursor-pointer"
        onClick={onMapToggle}
      >
        <span>Показать на карте</span>
        <div className="w-11 h-6 rounded-full bg-white/20 flex items-center px-1">
          <div
            className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              mapVisible ? "translate-x-5" : ""
            }`}
          />
        </div>
      </div>
      {/* Right — Store badges + Language */}
      <div className="flex items-center gap-3 max-sm:gap-1.5">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center rounded-lg hover:opacity-85 transition-opacity"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
            className="h-8 w-auto block max-sm:h-[22px]"
          />
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center rounded-lg hover:opacity-85 transition-opacity"
        >
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="App Store"
            className="h-8 w-auto block max-sm:h-[22px]"
          />
        </a>

        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="text-white/90 text-[14px] font-semibold cursor-pointer shrink-0 select-none outline-none">
            <span className="px-[10px] py-1 border border-white/40 rounded-md">
              {LANG_LABELS[lang]} ▾
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[300] min-w-[80px]">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <DropdownMenuItem
                key={l}
                className={l === lang ? "font-semibold text-[#622ADA]" : ""}
                onClick={() => setLang(l)}
              >
                {LANG_LABELS[l]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
