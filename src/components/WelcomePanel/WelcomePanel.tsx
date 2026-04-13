'use client';

import { useLang } from '../../contexts/LangContext';
import './WelcomePanel.css';

export function WelcomePanel() {
  const { t } = useLang();

  return (
    <div className="welcome-state">

      <div className="welcome-card" style={{ position: 'relative', zIndex: 1 }}>
        <h2>{t('welcomeTitle')}</h2>
        <p>{t('welcomeSubtitle')}</p>
        <p style={{ marginTop: 12 }}>{t('welcomeHint')}</p>
      </div>
    </div>
  );
}
