import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClinic } from '../lib/firebase';
import { getClinicInfo } from '../types/clinic';
import type { Clinic } from '../types/clinic';

const SUPPORTED_LANGS = ['en', 'cs', 'ru', 'uk'];

function formatSpec(s: string) {
  return s.replace(/_/g, ' ');
}

function getAvailableLangs(clinic: Clinic): string[] {
  const langs: string[] = [];
  for (const l of SUPPORTED_LANGS) {
    const info = getClinicInfo(clinic, l);
    if (info) langs.push(l);
  }
  return langs;
}

export function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getClinic(id)
      .then(data => {
        setClinic(data);
        
        if (data) {
          const langs = getAvailableLangs(data);
          if (langs.length > 0) setActiveLang(langs[0]);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="state-center">
      <div className="spinner" />
      <p>Loading clinic...</p>
    </div>
  );

  if (error || !clinic) return (
    <div className="state-center error">
      <p>{error || 'Clinic not found'}</p>
      <Link to="/" className="btn-secondary" style={{ marginTop: '16px' }}>← Back to list</Link>
    </div>
  );

  const availableLangs = getAvailableLangs(clinic);
  const infoHtml = getClinicInfo(clinic, activeLang);

  return (
    <div className="page-detail">
      <Link to="/" className="back-btn">← Back to Clinics</Link>

      <div className="detail-layout">
        {/* Main column */}
        <div className="detail-main">
          {/* Hero */}
          <div className="detail-card">
            <div className="detail-hero">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.name} className="hero-logo" />
              ) : (
                <div className="hero-logo hero-logo--placeholder">
                  {clinic.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="hero-name">{clinic.name}</h1>
                <div className="card-updated" style={{ marginTop: 6 }}>
                  <span className="dot-green" />
                  Updated {clinic.updatedAt}
                  <span className="rank-badge" style={{ marginLeft: 8 }}>Rank: {clinic.rank}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="detail-card">
            <div className="section-title">Contact Information</div>
            {clinic.address && (
              <div className="contact-row">
                <span className="contact-label">Address</span>
                <span className="contact-value">{clinic.address}</span>
              </div>
            )}
            {clinic.phone && (
              <div className="contact-row">
                <span className="contact-label">Phone</span>
                <a href={`tel:${clinic.phone}`} className="contact-value contact-link">{clinic.phone}</a>
              </div>
            )}
            {clinic.email && (
              <div className="contact-row">
                <span className="contact-label">Email</span>
                <a href={`mailto:${clinic.email}`} className="contact-value contact-link">{clinic.email}</a>
              </div>
            )}
            {clinic.website && (
              <div className="contact-row">
                <span className="contact-label">Website</span>
                <a href={clinic.website} target="_blank" rel="noreferrer" className="contact-value contact-link">
                  {clinic.website}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {infoHtml && (
            <div className="detail-card">
              <div className="section-title">Information</div>
              {availableLangs.length > 1 && (
                <div className="lang-tabs">
                  {availableLangs.map(l => (
                    <button
                      key={l}
                      className={`lang-tab ${activeLang === l ? 'active' : ''}`}
                      onClick={() => setActiveLang(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              {/* dangerouslySetInnerHTML — контент генерируется нами же, не user-input */}
              <div
                className="html-content"
                dangerouslySetInnerHTML={{ __html: infoHtml }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="detail-card">
            {clinic.languages.length > 0 && (
              <>
                <div className="section-title">Languages</div>
                <div className="pills-row">
                  {clinic.languages.map(l => (
                    <span key={l} className="spec-pill">{l.toUpperCase()}</span>
                  ))}
                </div>
              </>
            )}

            {clinic.specializations.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 16 }}>Specializations</div>
                <div className="pills-row">
                  {clinic.specializations.map(s => (
                    <span key={s} className="spec-pill">{formatSpec(s)}</span>
                  ))}
                </div>
              </>
            )}

            {/* Кнопка онлайн-записи — только если есть altegioCompanyId */}
            {clinic.altegioCompanyId && (
              <a
                href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`}
                target="_blank"
                rel="noreferrer"
                className="booking-btn"
                style={{ marginTop: 16 }}
              >
                Book appointment
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
