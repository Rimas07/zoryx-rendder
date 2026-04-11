'use client';

import { useEffect, useRef } from 'react';

export function InitialLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (sessionStorage.getItem('visited')) {
      el.style.display = 'none';
      return;
    }

    sessionStorage.setItem('visited', '1');

    const timer = setTimeout(() => {
      el.style.animation = 'loaderFadeOut 0.5s ease forwards';
      setTimeout(() => el.remove(), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #622ADA 0%, #0070BB 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24,
    }}>
      <style>{`
        @keyframes loaderFadeOut {
          to { opacity: 0; }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringRotateReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          40% { transform: scaleY(1); opacity: 1; }
        }
        .loader-ring-1 {
          animation: ringRotate 2s linear infinite;
        }
        .loader-ring-2 {
          animation: ringRotateReverse 1.4s linear infinite;
        }
        .loader-logo {
          animation: logoPulse 1.8s ease-in-out infinite;
        }
        .loader-dot-1 { animation: dotBounce 1.2s ease-in-out 0s infinite; }
        .loader-dot-2 { animation: dotBounce 1.2s ease-in-out 0.15s infinite; }
        .loader-dot-3 { animation: dotBounce 1.2s ease-in-out 0.3s infinite; }
      `}</style>

      {/* Logo + rings */}
      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Outer ring */}
        <div className="loader-ring-1" style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'rgba(255,255,255,0.9)',
          borderRightColor: 'rgba(255,255,255,0.3)',
        }} />

        {/* Inner ring */}
        <div className="loader-ring-2" style={{
          position: 'absolute', inset: 12,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'rgba(255,255,255,0.5)',
          borderLeftColor: 'rgba(255,255,255,0.8)',
        }} />

        {/* Glow circle behind logo */}
        <div style={{
          position: 'absolute', inset: 20,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(4px)',
        }} />

        {/* Logo as CSS background — не считается LCP */}
        <div className="loader-logo" style={{
          width: 80, height: 80,
          backgroundImage: 'url(/zoryx-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          position: 'relative', zIndex: 1,
        }} />
      </div>

      {/* Zoryx text */}
      <div style={{
        color: 'white',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: '0.05em',
        opacity: 0.95,
      }}>
        Zoryx
      </div>

      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 20 }}>
        {['loader-dot-1', 'loader-dot-2', 'loader-dot-3'].map((cls) => (
          <div key={cls} className={cls} style={{
            width: 8, height: 20,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.8)',
          }} />
        ))}
      </div>
    </div>
  );
}
