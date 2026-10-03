// Cookie consent: choices are stored in a first-party cookie and mirrored to Google Consent Mode v2.
// Nothing besides the essential cookies is loaded until the visitor opts in.

export type ConsentCategory = 'analytics' | 'marketing'

export interface CookieConsent {
  hasResponded: boolean
  categories: Record<ConsentCategory, boolean>
  timestamp?: number
}

export const COOKIE_CATEGORIES: { id: ConsentCategory; name: string; description: string }[] = [
  {
    id: 'analytics',
    name: 'Statistieken',
    description: 'Anonieme gegevens over bezoek en populaire pagina\'s, zodat we de webshop kunnen verbeteren.',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Maakt advertenties en aanbiedingen relevanter, bijvoorbeeld in Google Shopping.',
  },
]

const COOKIE_NAME = 'bp_cookie_consent'
const COOKIE_DAYS = 365

const emptyConsent = (): CookieConsent => ({ hasResponded: false, categories: { analytics: false, marketing: false } })

export const readStoredConsent = (): CookieConsent | null => {
  if (!import.meta.client) return null
  const raw = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`))
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.slice(COOKIE_NAME.length + 1))) as CookieConsent
    return parsed?.hasResponded ? { ...emptyConsent(), ...parsed, categories: { ...emptyConsent().categories, ...parsed.categories } } : null
  } catch {
    return null
  }
}

/** Pushes the visitor's choice to Google Consent Mode (no-op until gtag exists). */
export const applyConsentMode = (categories: Record<ConsentCategory, boolean>) => {
  if (!import.meta.client || typeof window.gtag !== 'function') return
  const state = (granted: boolean) => (granted ? 'granted' : 'denied')
  window.gtag('consent', 'update', {
    analytics_storage: state(categories.analytics),
    ad_storage: state(categories.marketing),
    ad_user_data: state(categories.marketing),
    ad_personalization: state(categories.marketing),
  })
}

export const useCookieConsent = () => {
  const consent = useState<CookieConsent>('cookie-consent', emptyConsent)
  const showBanner = useState('cookie-banner-visible', () => false)

  const save = (categories: Record<ConsentCategory, boolean>) => {
    const data: CookieConsent = { hasResponded: true, categories, timestamp: Date.now() }
    const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString()
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; expires=${expires}; path=/; SameSite=Lax${secure}`
    consent.value = data
    showBanner.value = false
    applyConsentMode(categories)
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'cookie_consent_update', consent_analytics: categories.analytics, consent_marketing: categories.marketing })
  }

  const acceptAll = () => save({ analytics: true, marketing: true })
  const rejectAll = () => save({ analytics: false, marketing: false })
  const savePreferences = (categories: Record<ConsentCategory, boolean>) => save(categories)

  /** Show the banner when no choice was made yet; call once on the client. */
  const init = () => {
    const stored = readStoredConsent()
    if (stored) consent.value = stored
    showBanner.value = !stored
  }

  /** Lets the visitor change their mind later (footer link). */
  const openSettings = () => { showBanner.value = true }

  return { consent, showBanner, init, acceptAll, rejectAll, savePreferences, openSettings }
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
