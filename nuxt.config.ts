import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  //
  routeRules: {
    '/': { swr: 600 },
    '/over-ons': { prerender: true },
    '/contact': { prerender: true },
    '/bmw-model-codes': { swr: 3600 },
    '/mini-model-codes': { swr: 3600 },
    '/producten': { swr: 3600 },
    '/producten/**': { swr: 600 },
    // Private / transactional pages: client-only and kept out of search results
    '/winkelwagen': { ssr: false, robots: false },
    '/kassa': { ssr: false, robots: false },
    '/bestelling-bevestigd': { ssr: false, robots: false },
    '/account/**': { ssr: false, robots: false },
    '/wishlist': { robots: false },
  },

  runtimeConfig: {
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
  modules: ['shadcn-nuxt', '@nuxtjs/seo', '@nuxt/image', '@pinia/nuxt'],
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