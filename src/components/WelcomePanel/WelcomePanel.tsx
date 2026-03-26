import { useLang } from '../../contexts/LangContext';
import './WelcomePanel.css';

export function WelcomePanel() {
  const { t } = useLang();
  return (
    <div className="welcome-state">
      <div className="welcome-card">
        <h2>{t('welcomeTitle')}</h2>
        <p>{t('welcomeSubtitle')}</p>
        <p style={{ marginTop: 12 }}>{t('welcomeHint')}</p>
      </div>
    </div>
  );
}
