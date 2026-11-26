// Google Consent Mode v2: everything denied by default (EU), then restored from the stored choice.
// The Google Tag Manager container is only loaded when NUXT_PUBLIC_GTM_ID is set.
// GTM is never injected on checkout, order-thank-you or account pages.

const SENSITIVE_PATHS = ['/kassa', '/bestelling-bevestigd', '/checkout', '/order-thanks']

function isTransactionalPath(path: string): boolean {
  if (SENSITIVE_PATHS.includes(path)) return true
  if (path.startsWith('/account/') || path === '/account') return true
  return false
}

let gtmLoaded = false

function injectGtm(gtmId: string): void {
  if (gtmLoaded) return
  gtmLoaded = true
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(script)
}

export default defineNuxtPlugin((nuxtApp) => {
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
  if (!gtmId) return

  const router = useRouter()

  // On initial load: inject only if not on a sensitive page
  if (!isTransactionalPath(window.location.pathname)) {
    injectGtm(gtmId)
  }

  // On route change: inject if navigating away from a sensitive page
  router.afterEach((to) => {
    if (!isTransactionalPath(to.path)) {
      injectGtm(gtmId)
    }
  })
})
