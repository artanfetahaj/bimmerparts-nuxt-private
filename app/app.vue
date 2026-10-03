<template>
  <NuxtLayout>
    <NuxtPage />
    <SelectCarVariantDialog />
    <ClientOnly><CookieBanner /></ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
import SelectCarVariantDialog from '@/components/Dialogs/SelectCarVariantDialog.vue'
import CookieBanner from '@/components/cookie/CookieBanner.vue'

// Show the cookie banner on first visit (client only)
const { init: initCookieConsent } = useCookieConsent()
onMounted(initCookieConsent)

// Site-wide structured data (Organization / LocalBusiness / WebSite)
useSchemaOrg([
  defineWebSite({
    name: 'BimmerParts',
    inLanguage: 'nl-NL',
  }),
  defineLocalBusiness({
    '@type': 'AutoPartsStore',
    name: 'BimmerParts',
    description: 'Originele en aftermarket BMW en MINI onderdelen, snel geleverd. Montage via TOFFER Automotive.',
    image: '/images/hero2.png',
    logo: '/images/bimmerparts-logo.png',
    telephone: '+31613767946',
    email: 'info@bimmerparts.nl',
    address: {
      streetAddress: 'Noorddammerweg 35, Unit 11',
      postalCode: '1424 NW',
      addressLocality: 'De Kwakel',
      addressCountry: 'NL',
    },
    openingHoursSpecification: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
      { dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
    ],
    sameAs: ['https://www.instagram.com/bimmerpartsnl/'],
  }),
])
</script>
