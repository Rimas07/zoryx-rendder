import { useState } from 'react';
import { useLang } from '../../contexts/LangContext';
import type { Lang } from '../../i18n';
import './Header.css';

const LANG_LABELS: Record<Lang, string> = { cs: 'CS', ru: 'RU', uk: 'UK', en: 'EN' };

interface Props {
  onLogoClick: () => void;
}

export function Header({ onLogoClick }: Props) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [mapOn, setMapOn] = useState(false);

  return (
    <header className="header">
    
      <div className="logo" onClick={onLogoClick}>
        <img src="/ZORYX LOGO .png" alt="Zoryx Logo" className="logo-icon" />
        <div className="logo-text">Zoryx</div>
      </div>

      <div className="header-center">
        <a className="store-btn" href="#" onClick={(e) => e.preventDefault()}>
          <img
            className="store-img"
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
          />
        </a>
        <a className="store-btn" href="#" onClick={(e) => e.preventDefault()}>
          <img className='store-img'
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="App Store"
          />
        </a>
      </div>

      <div className="lang-switcher" onClick={() => setOpen((o) => !o)}>
        <span className="lang-current">{LANG_LABELS[lang]} ▾</span>
        {open && (
          <div className="lang-dropdown">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <div
                key={l}
                className={`lang-option${l === lang ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLang(l);
                  setOpen(false);
                }}
              >
                {LANG_LABELS[l]}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
