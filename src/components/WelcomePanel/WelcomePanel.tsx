'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useLang } from '../../contexts/LangContext';
import './WelcomePanel.css';

gsap.registerPlugin(ScrambleTextPlugin);

export function WelcomePanel() {
  const { t } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sub1Ref = useRef<HTMLParagraphElement>(null);
  const sub2Ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline();

    // Card fade in
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 32, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    );

    // Title scramble
    if (titleRef.current) {
      tl.to(titleRef.current, {
        scrambleText: {
          text: t('welcomeTitle'),
          chars: 'upperAndLowerCase',
          revealDelay: 0.2,
          tweenLength: false,
        },
        duration: 1.4,
        ease: 'none',
      }, '-=0.1');
    }

    // Subtitle 1 scramble
    if (sub1Ref.current) {
      tl.to(sub1Ref.current, {
        scrambleText: {
          text: t('welcomeSubtitle'),
          chars: 'lowerCase',
          revealDelay: 0.3,
          tweenLength: false,
        },
        duration: 1.0,
        ease: 'none',
      }, '-=0.6');
    }

    // Subtitle 2 scramble
    if (sub2Ref.current) {
      tl.to(sub2Ref.current, {
        scrambleText: {
          text: t('welcomeHint'),
          chars: 'lowerCase',
          revealDelay: 0.3,
          tweenLength: false,
        },
        duration: 0.9,
        ease: 'none',
      }, '-=0.5');
    }
  }, []);

  return (
    <div className="welcome-state">
      <div ref={cardRef} className="welcome-card">
        <h2 ref={titleRef}>{t('welcomeTitle')}</h2>
        <p ref={sub1Ref}>{t('welcomeSubtitle')}</p>
        <p ref={sub2Ref} style={{ marginTop: 12 }}>{t('welcomeHint')}</p>
      </div>
    </div>
  );
}
