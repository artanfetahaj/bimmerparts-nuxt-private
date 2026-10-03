import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

const toUrl = (p: { slug?: string; updated_at?: string }): SitemapUrlInput | null =>
  p?.slug
    ? { loc: `/producten/${p.slug}`, lastmod: p.updated_at, changefreq: 'weekly', priority: 0.7 }
    : null

// Feeds every product detail page into the sitemap (static routes are added automatically).
export default defineSitemapEventHandler(async () => {
  const apiBase = (process.env.VITE_APP_HOST_API || process.env.API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')
  const headers = { Accept: 'application/json' }

  // Preferred: one lightweight call returning only slug + updated_at
  try {
    const res: any = await $fetch(`${apiBase}/public/products/sitemap`, { headers })
    if (Array.isArray(res?.data)) return res.data.map(toUrl).filter(Boolean) as SitemapUrlInput[]
  } catch {
    // API not updated yet — fall back to walking the paginated product list
  }

  const urls: SitemapUrlInput[] = []
  try {
    let page = 1
    let lastPage = 1
    do {
      const res: any = await $fetch(`${apiBase}/public/products`, { params: { page, per_page: 100 }, headers })
      for (const p of res?.data ?? []) {
        const url = toUrl(p)
        if (url) urls.push(url)
      }
      lastPage = res?.meta?.last_page ?? 1
      page++
    } while (page <= lastPage)
  } catch (error) {
    console.error('[sitemap] Failed to load products:', error)
  }
  return urls
})
