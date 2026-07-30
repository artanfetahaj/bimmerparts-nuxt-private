import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: (_routes) => {
    const map: Record<string, string> = {
      '/products': '/producten',
      '/products/:slug()': '/producten/:slug()',
      '/about': '/over-ons',
      '/cart': '/winkelwagen',
      '/order-thanks': '/bestelling-bevestigd',
      '/checkout': '/kassa',
    }

    const renamed = _routes.map(route =>
      map[route.path] ? { ...route, path: map[route.path] } : route,
    )

    // Redirect old English URLs to Dutch equivalents
    renamed.push(
      { path: '/products', redirect: '/producten' },
      { path: '/products/:slug(.*)*', redirect: (to: any) => `/producten/${to.params.slug}` },
      { path: '/about', redirect: '/over-ons' },
      { path: '/cart', redirect: '/winkelwagen' },
      { path: '/order-thanks', redirect: '/bestelling-bevestigd' },
      { path: '/checkout', redirect: '/kassa' },
    )

    return renamed
  },
}
