'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useLang } from '../../contexts/LangContext';
import { useA11y } from '../../contexts/A11yContext';
import './WelcomePanel.css';

gsap.registerPlugin(ScrambleTextPlugin);

export function WelcomePanel() {
  const { t } = useLang();
  const { settings } = useA11y();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sub1Ref = useRef<HTMLParagraphElement>(null);
  const sub2Ref = useRef<HTMLParagraphElement>(null);

  const init = useCallback(async () => {
    await initParticlesEngine(loadSlim);
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 32, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    );

    if (titleRef.current) {
      tl.to(titleRef.current, {
        scrambleText: { text: t('welcomeTitle'), chars: 'upperAndLowerCase', revealDelay: 0.2, tweenLength: false },
        duration: 1.4, ease: 'none',
      }, '-=0.1');
    }

    if (sub1Ref.current) {
      tl.to(sub1Ref.current, {
        scrambleText: { text: t('welcomeSubtitle'), chars: 'lowerCase', revealDelay: 0.3, tweenLength: false },
        duration: 1.0, ease: 'none',
      }, '-=0.6');
    }

    if (sub2Ref.current) {
      tl.to(sub2Ref.current, {
        scrambleText: { text: t('welcomeHint'), chars: 'lowerCase', revealDelay: 0.3, tweenLength: false },
        duration: 0.9, ease: 'none',
      }, '-=0.5');
    }
  }, []);

  return (
    <div className="welcome-state">
      {/* Particles background */}
      {!settings.reducedMotion && (
        <Particles
          id="welcome-particles"
          className="absolute inset-0 pointer-events-none"
          options={{
            background: { color: { value: 'transparent' } },
            fpsLimit: 60,
            particles: {
              number: { value: 48, density: { enable: true } },
              color: { value: ['#a78bfa', '#60a5fa', '#ffffff'] },
              opacity: { value: { min: 0.15, max: 0.55 }, animation: { enable: true, speed: 0.6, sync: false } },
              size: { value: { min: 1.5, max: 4 } },
              move: {
                enable: true,
                speed: 0.6,
                direction: 'none',
                random: true,
                outModes: { default: 'out' },
              },
              links: {
                enable: true,
                color: '#a78bfa',
                opacity: 0.18,
                distance: 120,
                width: 1,
              },
            },
            detectRetina: true,
          }}
        />
      )}

      <div ref={cardRef} className="welcome-card" style={{ position: 'relative', zIndex: 1 }}>
        <h2 ref={titleRef}>{t('welcomeTitle')}</h2>
        <p ref={sub1Ref}>{t('welcomeSubtitle')}</p>
        <p ref={sub2Ref} style={{ marginTop: 12 }}>{t('welcomeHint')}</p>
      </div>
    </div>
  );
}
