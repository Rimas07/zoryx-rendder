# Zoryx Web — Medical Clinic Directory for Prague

A Next.js web app for finding medical clinics in Prague. Designed for immigrants and expats — supports Russian, Ukrainian, Czech, and English. Includes an AI chatbot that matches symptoms to the right specialist.

**Live:** [web.zoryx.app](https://web.zoryx.app) · Backup: [zoryxweb-production.up.railway.app](https://zoryxweb-production.up.railway.app)

---

## What it does

- Browse 500+ clinics with interactive map, filters, and full-text search
- Filter by specialization, language spoken, insurance
- AI chatbot: describe symptoms → get clinic recommendation
- 4 languages: RU / UK / CS / EN with RTL support
- Accessibility module: high contrast, large fonts, colorblind mode
- Mobile-responsive, works as PWA

---

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, SSR) |
| UI | React 18, Tailwind CSS, shadcn/ui, Radix UI |
| Map | Leaflet + react-leaflet, Mapy.cz geocoding |
| Database | Firebase Firestore |
| Hosting | Firebase App Hosting (web.zoryx.app) |
| AI | OpenAI API (gpt-4o-mini) |
| Animations | GSAP |

---

## Getting started

```bash
git clone <repo>
cd zoryx-web
npm install
```

Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_MAPYCZ_KEY=
NEXT_PUBLIC_JAWG_TOKEN=
OPENAI_API_KEY=
```

```bash
npm run dev      # localhost:3000
npm run build
npm start
```

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout — wraps everything in LangProvider
│   ├── page.tsx             # Home — fetches clinics server-side → ClinicsLayout
│   ├── clinic/[id]/         # Individual clinic page with static generation
│   └── api/
│       ├── chat/            # AI chatbot endpoint (rate-limited, origin-checked)
│       └── clinics/         # Clinic list with 5-min cache
│
├── components/
│   ├── ClinicsLayout.tsx    # Main layout — search, filters, list, detail panel
│   ├── ClinicCard/          # Card in the list with favorite, map, phone buttons
│   ├── ClinicDetail/        # Full clinic info — specs, contacts, map flip
│   ├── ChatBot/             # Floating AI assistant
│   ├── FilterPanel/         # Specialization filter modal
│   ├── Header/              # Logo, language switcher, app store badges
│   └── MapView/             # Leaflet map with animated marker
│
├── hooks/
│   └── useClinics.ts        # Client-side filtering by search / lang / spec
│
├── contexts/
│   └── LangContext.tsx      # Lang state + t() and tSpec() translation hooks
│
├── lib/
│   ├── firebase.ts          # getClinics(), getClinic(), getSpecializations()
│   └── firebase-app.ts      # Firebase init (singleton)
│
├── types/
│   └── clinic.ts            # Clinic interface + getClinicInfo() helper
│
├── i18n.ts                  # Translations for EN/CS/RU/UK (36 keys + spec names)
└── constants.ts             # ALL_SPECIALIZATIONS list
```

---

## How the AI chatbot works

1. User describes symptoms in any supported language
2. Request hits `/api/chat` — origin and rate-limit checked server-side
3. Clinic list is fetched fresh from Firestore (not from client)
4. OpenAI returns a recommendation with a structured suffix: specialization + clinic name
5. Frontend parses the suffix, applies the filter, and opens the clinic card

The system prompt is built dynamically from the actual clinic data in Firestore — no hardcoding.

---

## Clinic data model

```ts
interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  photoUrl?: string
  rank: number                    // sort order
  languages: string[]             // e.g. ['ru', 'cs', 'en']
  specializations: string[]       // keys from i18n.ts specTranslations
  insurances?: string
  altegioCompanyId?: string       // booking link
  isPartner?: boolean
  info?: Record<string, string>   // multilingual HTML description
}
```

---

## Environment notes

- Clinic data is cached in memory for 5 minutes (`CACHE_TTL = 300_000`)
- `/api/chat` allows max 20 requests/minute per IP
- CORS is locked to `web.zoryx.app` and the Railway backup URL
- CSP, HSTS, X-Frame-Options and other security headers are set in `next.config.mjs`

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm start        # start production server
npm run lint     # ESLint
```
