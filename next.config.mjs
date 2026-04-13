import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Запрещает открывать сайт в iframe на других сайтах (защита от кликджекинга)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Запрещает браузеру угадывать тип контента
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Не передавать referrer на внешние сайты
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Разрешает использовать только https в течение 1 года
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Белый список откуда можно грузить ресурсы
          { key: 'Content-Security-Policy', value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://flagcdn.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://gsprqyfmodotiezvopiq.supabase.co https://tile.jawg.io https://developer.apple.com https://upload.wikimedia.org",
            "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://api.openai.com https://api.mapy.cz https://tile.jawg.io https://*.google-analytics.com https://*.analytics.google.com",
            "frame-ancestors 'none'",
          ].join('; ') },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
