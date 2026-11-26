import tailwindcss from '@tailwindcss/vite'

// Fail the build if the API URL uses plain HTTP in production
if (process.env.NODE_ENV === 'production') {
  const apiUrl = process.env.API_URL || ''
  if (apiUrl.startsWith('http://')) {
    throw new Error(`[SECURITY] API_URL must use HTTPS in production, got: ${apiUrl}`)
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  //
  routeRules: {
    '/': { swr: 600 },
    '/over-ons': { prerender: true },
    '/contact': { prerender: true },
    '/bmw-model-codes': { swr: 3600 },
    '/mini-model-codes': { swr: 3600 },
    '/producten': { swr: 3600 },
    '/producten/**': { swr: 600 },
    // Private / transactional pages: client-only and kept out of search results.
    // Strictest CSP: no GTM hosts (GTM is intentionally not loaded on these routes).
    '/winkelwagen': { ssr: false, robots: false },
    '/kassa': {
      ssr: false, robots: false,
      security: {
        headers: {
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'connect-src': ["'self'", process.env.API_URL || 'http://localhost:8000'],
            'img-src': ["'self'", 'data:', 'https://bimmerparts-public.s3.eu-central-1.amazonaws.com', 'https://besa-crm.s3.eu-central-1.amazonaws.com'],
            'frame-src': ['https://www.mollie.com'],
            'form-action': ["'self'", 'https://www.mollie.com'],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'object-src': ["'none'"],
            'upgrade-insecure-requests': true,
          },
        },
      },
    },
    '/bestelling-bevestigd': {
      ssr: false, robots: false,
      security: {
        headers: {
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'connect-src': ["'self'", process.env.API_URL || 'http://localhost:8000'],
            'img-src': ["'self'", 'data:'],
            'frame-src': ["'none'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'object-src': ["'none'"],
            'upgrade-insecure-requests': true,
          },
        },
      },
    },
    '/account/**': {
      ssr: false, robots: false,
      security: {
        headers: {
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'connect-src': ["'self'", process.env.API_URL || 'http://localhost:8000'],
            'img-src': ["'self'", 'data:'],
            'frame-src': ["'none'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'object-src': ["'none'"],
            'upgrade-insecure-requests': true,
          },
        },
      },
    },
    '/wishlist': { robots: false },
  },

  runtimeConfig: {
    geocodeApiUrl: process.env.NUXT_GEOCODE_API_URL || '',
    geocodeApiKey: process.env.NUXT_GEOCODE_API_KEY || '',
    public: {
      apiUrl: process.env.API_URL || 'http://127.0.0.1:8000/api',
      // Google Tag Manager container (e.g. GTM-XXXXXXX). Only loaded when set; consent mode gates what fires.
      gtmId: process.env.NUXT_PUBLIC_GTM_ID || '',
    },
  },
  
   app: {
    head: {
      htmlAttrs: {
        lang: 'nl',
      },

      link: [
        // Favicon
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon/favicon1.png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/favicon/favicon1.png',
        },
      ],

      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ],
    },
  },
  sitemap: {
    cacheMaxAgeSeconds: 60 * 60, // product sitemap walks the whole catalogue via the API; rebuild hourly at most
    sources: ['/api/__sitemap__/urls'],
    // Old English URLs only redirect to the Dutch ones; private pages must not be listed
    exclude: [
      '/products/**', '/products', '/about', '/cart', '/checkout', '/order-thanks',
      '/winkelwagen', '/kassa', '/bestelling-bevestigd', '/account/**', '/wishlist',
      '/privacy', '/terms', // placeholder pages, noindexed
    ],
  },
  robots: {
    disallow: ['/winkelwagen', '/kassa', '/bestelling-bevestigd', '/account', '/wishlist'],
  },
  site: {
    url: 'https://bimmerparts.nl',
    name: 'bimmerparts.nl',
    description: 'Originele en aftermarket BMW onderdelen voor alle modellen. Snel geleverd vanuit eigen voorraad.',
    defaultLocale: 'nl',
  },
  seo: {
    meta: {
      title: 'BimmerParts — Originele BMW Onderdelen',
      description: 'Originele en aftermarket BMW onderdelen voor alle modellen. Snel geleverd vanuit eigen voorraad.',
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
      twitterCreator: '@bimmerpartsnl',
      twitterSite: '@bimmerpartsnl',
      author: 'BimmerParts',
      colorScheme: 'dark light',
      applicationName: 'BimmerParts',

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: 'BimmerParts',
      ogLocale: 'nl_NL',
      ogType: 'website',
      ogUrl: 'https://bimmerparts.nl',
      ogTitle: 'BimmerParts — Originele BMW Onderdelen',
      ogImage: '/images/hero2.png',
      twitterImage: '/images/hero2.png',

      robots: 'index, follow',
    }
  },
  modules: ['nuxt-security', 'shadcn-nuxt', '@nuxtjs/seo', '@nuxt/image', '@pinia/nuxt'],

  security: {
    // Disable entirely in dev — Nuxt dev server injects Vite HMR scripts, devtools and inline
    // bootstrap code without nonces, which would all be blocked by a strict CSP.
    // Headers are only meaningful (and enforced by Amplify's customHttp.yml) in production.
    enabled: process.env.NODE_ENV === 'production',

    nonce: true,

    // nuxt-security rate-limiter and request-size-limiter conflict with SWR/ISR caching on Nitro,
    // where prerender routes are served without going through the Node handler at all.
    // The API already enforces its own rate limits; disabling here avoids false 429s on cached routes.
    rateLimiter: false,
    requestSizeLimiter: false,

    headers: {
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
        preload: true,
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
      },
      // When NUXT_CSP_REPORT_ONLY=true, switch to report-only mode (Amplify env var).
      // SWR/prerender routes bypass the Nitro handler, so CSP for those pages is set
      // in customHttp.yml using hash-based allowlists instead of nonces.
      contentSecurityPolicy: process.env.NUXT_CSP_REPORT_ONLY === 'true' ? false : {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'nonce-{{nonce}}'",
          "'strict-dynamic'",
          'https://www.googletagmanager.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': [
          "'self'",
          process.env.API_URL || 'http://localhost:8000',
          'https://*.google-analytics.com',
          'https://*.googletagmanager.com',
        ],
        'img-src': [
          "'self'",
          'data:',
          // Product images (the actual CDN bucket used by bimmerparts)
          'https://bimmerparts-public.s3.eu-central-1.amazonaws.com',
          // Legacy / CRM bucket referenced in some admin-uploaded images
          'https://besa-crm.s3.eu-central-1.amazonaws.com',
          'https://www.google-analytics.com',
          'https://www.googletagmanager.com',
        ],
        'frame-src': ['https://www.googletagmanager.com'],
        'form-action': ["'self'", 'https://www.mollie.com'],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': true,
      },
    },
  },
  buildModules: ["@nuxtjs/svg"],
  
  image: {
    format: ['webp'],
    screens: {
      default: 320,
      xxs: 480,
      xs: 576,
      sm: 768,
      md: 996,
      lg: 1200,
      xl: 1367,
      xxl: 1600,
      '4k': 1921,
    },

    // domains: ['besasuite.nl', 'besa-crm.s3.eu-central-1.amazonaws.com'],

    alias: {
      youtube: 'https://img.youtube.com',
      vimeo: 'https://i.vimeocdn.com',
    }
  },
  
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  //
  nitro: {
    prerender: {
      failOnError: false,
      // Never crawl: following links from /producten prerendered ~900 product pages per build,
      // each hitting the API. Only the routes with `prerender: true` in routeRules are built.
      crawlLinks: false,
      ignore: ['/producten', '/products', '/winkelwagen', '/kassa', '/bestelling-bevestigd', '/account', '/wishlist'],
    }
  }
})