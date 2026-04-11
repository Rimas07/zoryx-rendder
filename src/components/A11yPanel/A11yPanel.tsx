'use client';

import { useState, useRef, useEffect } from 'react';
import { Contrast, ZoomIn, Zap, Eye } from 'lucide-react';
import { useA11y } from '../../contexts/A11yContext';
import { useLang } from '../../contexts/LangContext';

export function A11yPanel() {
  const { settings, toggle } = useA11y();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const anyActive = Object.values(settings).some(Boolean);

  const modes = [
    { key: 'highContrast' as const, icon: <Contrast size={16} />, label: t('a11yHighContrast') },
    { key: 'largeText'    as const, icon: <ZoomIn size={16} />,   label: t('a11yLargeText') },
    { key: 'reducedMotion'as const, icon: <Zap size={16} />,      label: t('a11yReducedMotion') },
    { key: 'colorblind'   as const, icon: <Eye size={16} />,      label: t('a11yColorblind') },
  ];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={t('a11yTitle')}
        className={[
          'flex items-center justify-center w-8 h-8 rounded-full border transition-all',
          anyActive
            ? 'bg-white text-[#622ADA] border-white'
            : 'bg-white/10 text-white/80 border-white/30 hover:bg-white/20 hover:text-white',
        ].join(' ')}
      >
        <Eye size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-[400] w-[220px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-[#e2dff5] overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#622ADA] to-[#0070BB]">
            <p className="text-white text-[13px] font-semibold">{t('a11yTitle')}</p>
          </div>
          <div className="py-2">
            {modes.map(({ key, icon, label }) => {
              const active = settings[key];
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-[10px] text-[13px] transition-colors text-left',
                    active
                      ? 'bg-[#ede9ff] text-[#5b4fcf] font-semibold'
                      : 'text-[#1a1535] hover:bg-[#f5f4fc]',
                  ].join(' ')}
                >
                  <span className={active ? 'text-[#5b4fcf]' : 'text-[#9d99c0]'}>{icon}</span>
                  {label}
                  {active && <span className="ml-auto w-2 h-2 rounded-full bg-[#5b4fcf]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
