## Запуск

```bash
npm install

npm run dev         localhost:3000
npm run build
npm start
```

ЕСЛИ ЛЕНЬ ТО https://zoryxweb-production.up.railway.app/

## Структура

```
src/
├── app/
│   ├── layout.tsx          # RootLayout — оборачивает в LangProvider
│   ├── page.tsx            # Server Component — fetch clinics → <ClinicsLayout>
│   └── globals.css
├── components/
│   ├── ClinicsLayout.tsx   # 'use client' — весь UI и state
│   ├── ClinicCard/
│   ├── ClinicDetail/
│   ├── FilterPanel/
│   ├── Header/
│   └── WelcomePanel/
├── hooks/
│   └── useClinics.ts       # 'use client' — фильтрация по initialClinics
├── contexts/
│   └── LangContext.tsx     # lang + t() хук
├── lib/
│   ├── firebase.ts         # getClinics() / getClinic(id)
│   └── mockData.ts         # fallback при недоступном Firestore
├── types/
│   └── clinic.ts           # Clinic, ClinicInfo, getClinicInfo()
├── constants.ts            # ALL_SPECIALIZATIONS[]
└── i18n.ts                 # переводы en/cs/ru/uk (36 ключей)
```
