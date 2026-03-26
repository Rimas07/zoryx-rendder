'use client';

import {
  Phone, MessageCircle, Heart,
  Umbrella, Stethoscope, BookOpen,
  Mail, MapPin, Globe,
} from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import { getClinicInfo } from '../../types/clinic';
import type { Clinic } from '../../types/clinic';
import './ClinicDetail.css';

interface Props {
  clinic: Clinic;
}

export function ClinicDetail({ clinic }: Props) {
  const { t, lang } = useLang();
  const infoHtml = getClinicInfo(clinic, lang);


  return (
    <div className="clinic-detail">
      {/* ================= HERO SECTION ================= */}

      <div className="detail-hero">
        <button className="detail-heart-btn">
          <Heart size={22} className="heart-filled" />
        </button>

        {/* ================= LOGO CLINIKY ================= */}

        <div className="detail-hero-logo-wrap">
          <img
            src={clinic.photoUrl || "/Icon clinics.png"}
            alt={clinic.name}
            className="detail-logo"
          />
        </div>

        <div className="detail-name">{clinic.name}</div>
        {/* =================  CALL ACT BUTT ================= */}

        <div className="detail-hero-actions">
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="detail-action-btn detail-action-btn--phone"
            >
              <Phone size={18} strokeWidth={2.5} />
            </a>
          )}
        </div>
      </div>

      {/* ================= OPISANIE KLIIKY ================= */}

      <div className="detail-section">
        {/* ABOUT */}

        <div className="detail-section-title">{t("aboutClinic")}</div>

        {/* LANGUAGES */}

        {clinic.languages.length > 0 && (
          <div className="detail-lang-row">
            <span>{t("weSpeak")}</span>
            <div className="lang-flags">
              {clinic.languages.map((l) => {
                const flags: Record<string, string> = {
                  cs: "https://flagcdn.com/w40/cz.png",
                  ru: "https://flagcdn.com/w40/ru.png",
                  uk: "https://flagcdn.com/w40/ua.png",
                  en: "https://flagcdn.com/w40/gb.png",
                };

                const code = l.toLowerCase();

                return flags[code] ? (
                  <img
                    key={l}
                    src={flags[code]}
                    alt={l}
                    title={l}
                    className="flag"
                  />
                ) : null;
              })}
            </div>
           
          </div>
        )}

        {clinic.insurances && (
          <div className="detail-info-row">
            <Umbrella
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">{t("insurance")}</div>
              <div
                className="detail-info-value"
                style={{ whiteSpace: "pre-line" }}
              >
                {clinic.insurances
                  .split(",")
                  .map((s) => s.trim())
                  .join("\n")}
              </div>
            </div>
          </div>
        )}

        {clinic.specializations.length > 0 && (
          <div className="detail-info-row">
            <Stethoscope
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">
                {t("specializationsLabel")}
              </div>
              <div className="detail-spec-pills" style={{ marginTop: 6 }}>
                {clinic.specializations.map((s) => (
                  <span key={s} className="detail-spec-pill">
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {infoHtml && (
          <div className="detail-info-row">
            <BookOpen
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div style={{ flex: 1 }}>
              <div className="detail-info-label">{t("additionalInfo")}</div>
              <div
                className="html-content"
                dangerouslySetInnerHTML={{ __html: infoHtml }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contacts */}
      <div className="detail-section">
        <div className="detail-section-title">{t("contacts")}</div>

        {clinic.phone && (
          <div className="detail-info-row">
            <Phone
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">{t("phoneNumber")}</div>
              <a
                href={`tel:${clinic.phone}`}
                className="detail-info-value contact-link"
              >
                {clinic.phone}
              </a>
            </div>
          </div>
        )}
        {clinic.email && (
          <div className="detail-info-row">
            <Mail
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">{t("email")}</div>
              <a
                href={`mailto:${clinic.email}`}
                className="detail-info-value contact-link"
              >
                {clinic.email}
              </a>
            </div>
          </div>
        )}
        {clinic.address && (
          <div className="detail-info-row">
            <MapPin
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">{t("address")}</div>
              <div className="detail-info-value">{clinic.address}</div>
            </div>
          </div>
        )}
        {clinic.website && (
          <div className="detail-info-row">
            <Globe
              size={20}
              strokeWidth={1.8}
              color="#5b4fcf"
              className="detail-row-icon"
            />
            <div>
              <div className="detail-info-label">{t("website")}</div>
              <a
                href={clinic.website}
                target="_blank"
                rel="noreferrer"
                className="detail-info-value contact-link"
              >
                {clinic.website}
              </a>
            </div>
          </div>
        )}

        {clinic.address && (
          <div className="detail-map-wrap">
            <iframe
              title="map"
              className="detail-map"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                clinic.address
              )}&output=embed`}
            />
          </div>
        )}
      </div>

      {clinic.altegioCompanyId && (
        <a
          href={`https://n.novakvita.com/company/${clinic.altegioCompanyId}`}
          target="_blank"
          rel="noreferrer"
          className="booking-btn"
        >
          {t("bookAppointment")}
        </a>
      )}
    </div>
  );
}
