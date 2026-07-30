import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  //
  routeRules: {
    '/': { prerender: true },
    '/over-ons': { prerender: true },
    '/contact': { prerender: true },
    '/bmw-model-codes': { swr: 3600 },
    '/producten': { swr: 3600 },
    '/producten/**': { swr: 600 },
    '/winkelwagen': { ssr: false },
    '/kassa': { ssr: false },
    '/bestelling-bevestigd': { ssr: false },
    '/account': { ssr: false },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://127.0.0.1:8000/api',
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
  modules: ['shadcn-nuxt', '@nuxtjs/seo', 'nuxt-booster', '@pinia/nuxt'],
  buildModules: ["@nuxtjs/svg"],
  
  booster: {
    detection: {
      performance: true,
      browserSupport: true
    },

    performanceMetrics: {
      device: {
        hardwareConcurrency: { min: 2, max: 48 },
        deviceMemory: { min: 2 }
      },
      timing: {
        fcp: 800,
        dcl: 1200
      }
    },

    targetFormats: ['webp', 'avif', 'jpg|jpeg|png|gif'],

    componentAutoImport: false,
    componentPrefix: undefined,

    lazyOffset: {
      component: '0%',
      asset: '0%'
    }
  },

  image: {
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
      crawlLinks: true,
    }
  }
})