import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  //
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    '/products': { swr: 3600 },
    '/product/**': { swr: 600 },
    '/cart': { ssr: false },
    '/account': { ssr: false },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'https://api.erp.dev.besasuite.nl/api',
    },
  },
  
  app: {
    head: {
      link: [
        // Favicons
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon/favicon.ico'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-touch-icon.png'
        },
        {
          rel: 'manifest',
          href: '/favicon/site.webmanifest'
        },
      ]
    }
  },
  site: {
    url: 'https://bimmerparts.nl',
    name: 'bimmerparts.nl',
    description: 'Welcome to my awesome site!',
    defaultLocale: 'nl',
  },
  seo: {
    meta: {
      description: 'Welcome to my awesome site!',
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
      twitterCreator: '@mytwitter',
      twitterSite: '@mysite',
      author: 'bimmerparts',
      colorScheme: 'dark light',
      applicationName: 'bimmerparts.nl',

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: 'bimmerparts.nl',
      ogLocale: 'nl_NL',
      ogType: 'website',
      ogUrl: 'https://bimmerparts.nl',
      ogTitle: 'bimmerparts.nl',

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
})