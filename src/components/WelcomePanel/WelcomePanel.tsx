'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../../contexts/LangContext';
import './WelcomePanel.css';

export function WelcomePanel() {
  const { t } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 32, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="welcome-state">
      <div ref={cardRef} className="welcome-card">
        <h2>{t('welcomeTitle')}</h2>
        <p>{t('welcomeSubtitle')}</p>
        <p style={{ marginTop: 12 }}>{t('welcomeHint')}</p>
      </div>
    </div>
  );
}
