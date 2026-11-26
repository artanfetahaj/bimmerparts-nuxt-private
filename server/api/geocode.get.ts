// Proxies postcode-lookup calls to the geocode API so the API key stays server-side.
// In-memory per-IP rate limit: 30 requests per minute.

const NL_POSTCODE_RE = /^\d{4}\s?[A-Z]{2}$/i
const HN_RE = /^\d{1,5}$/

const ipHits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 30

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= MAX_PER_WINDOW
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiUrl = config.geocodeApiUrl
  const apiKey = config.geocodeApiKey

  if (!apiUrl || !apiKey) {
    throw createError({ statusCode: 503, message: 'Geocode service not configured' })
  }

  const query = getQuery(event) as Record<string, string>
  const { postcode, house_number, house_number_addition } = query

  if (!postcode || !NL_POSTCODE_RE.test(postcode.trim())) {
    throw createError({ statusCode: 422, message: 'Ongeldig postcode formaat (verwacht: 1234AB)' })
  }
  if (!house_number || !HN_RE.test(house_number.trim())) {
    throw createError({ statusCode: 422, message: 'Ongeldig huisnummer' })
  }

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
    || event.node.req.socket?.remoteAddress
    || 'unknown'

  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Te veel verzoeken. Probeer het over een minuut opnieuw.' })
  }

  const params = new URLSearchParams({
    postcode: postcode.trim().toUpperCase(),
    house_number: house_number.trim(),
    ...(house_number_addition ? { house_number_addition: house_number_addition.trim() } : {}),
  })

  try {
    const upstream = await $fetch(`${apiUrl}/autocomplete?${params}`, {
      headers: { 'X-Api-Key': apiKey },
    })
    return upstream
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode || 502
    throw createError({ statusCode: status, message: 'Adres niet gevonden' })
  }
})
