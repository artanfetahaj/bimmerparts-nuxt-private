// Google Consent Mode v2: everything denied by default (EU), then restored from the stored choice.
// The Google Tag Manager container is only loaded when NUXT_PUBLIC_GTM_ID is set.
export default defineNuxtPlugin(() => {
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  })

  // Returning visitors: apply their saved choice before any tag fires
  const stored = readStoredConsent()
  if (stored) applyConsentMode(stored.categories)

  const gtmId = useRuntimeConfig().public.gtmId as string | undefined
  if (gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    document.head.appendChild(script)
  }
})
