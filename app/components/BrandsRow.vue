<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getProductBrands, type ProductBrand } from '~/services/productBrand'

// ─── Static partner config (logos, hrefs, CTAs) ───────────────────────────────
// `slugMatch` is tried first; `nameMatch` is the fallback (case-insensitive contains).
interface PartnerConfig {
  slugMatch: string
  nameMatch: string
  logo: string
  wide?: boolean
  href?: string
}

const PARTNER_CONFIG: PartnerConfig[] = [
  {
    slugMatch: 'kn',
    nameMatch: 'k&n',
    logo: '/images/K&N-Performance filters-logo.png',
  },
  {
    slugMatch: 'cobra',
    nameMatch: 'cobra',
    logo: '/images/Cobra-suspensions-logo.png',
    href: '/cobra-suspension',
  },
  {
    slugMatch: 'strongflex',
    nameMatch: 'strongflex',
    logo: '/images/Strongflex-logo.png',
    wide: true,
  },
  {
    slugMatch: 'eventuri',
    nameMatch: 'eventuri',
    logo: '/images/Eventuri-logo.png',
    wide: true,
    href: '/eventuri',
  },
]

// ─── State ────────────────────────────────────────────────────────────────────
interface ResolvedBrand {
  id: string       // UUID — used as ?brand= filter param
  name: string
  logo: string
  wide?: boolean
  href?: string
}

const resolvedBrands = ref<ResolvedBrand[]>([])

// ─── Resolve brands from API ──────────────────────────────────────────────────
function matchBrand(apiBrand: ProductBrand, cfg: PartnerConfig): boolean {
  const slug = (apiBrand.slug ?? '').toLowerCase()
  const name = (apiBrand.name ?? '').toLowerCase()
  return slug.includes(cfg.slugMatch) || name.includes(cfg.nameMatch)
}

onMounted(async () => {
  try {
    const allBrands = await getProductBrands()

    resolvedBrands.value = PARTNER_CONFIG.flatMap((cfg) => {
      const found = allBrands.find((b) => matchBrand(b, cfg))
      if (!found) return []
      return [{
        id: found.id,
        name: found.name,
        logo: cfg.logo,
        wide: cfg.wide,
        href: cfg.href,
      }]
    })
  } catch (e) {
    console.error('BrandsRow: failed to load partner brands', e)
  }
})
</script>

<template>
  <section class="w-full bg-white py-8 border-t border-b border-gray-100">
    <div class="outer-container">
      <h2 class="text-2xl font-normal text-gray-900 mb-6">Partnermerken</h2>
      <div class="flex flex-wrap justify-between gap-6 md:gap-10">
        <NuxtLink
          v-for="brand in resolvedBrands"
          :key="brand.id"
          :to="brand.href ?? `/products?brand=${encodeURIComponent(brand.id)}`"
          :class="[
            brand.wide ? 'max-w-[400px]' : 'max-w-[300px]',
            brand.name.toLowerCase().includes('eventuri') ? 'pb-6' : '',
            'flex w-[calc(50%-12px)] md:w-auto md:flex-1 group'
          ]"
        >
          <NuxtImg
            :src="brand.logo"
            :alt="brand.name"
            class="max-h-[500px] w-full object-contain"
          />
        </NuxtLink>
      </div>

      <!-- Eventuri CTA -->
      <p class="mt-4 text-sm text-gray-600">
        Wil je kijken welke Eventuri upgrade er voor jouw BMW of MINI is?
        <NuxtLink
          to="/eventuri"
          class="text-orange-500 hover:underline font-medium"
        >Klik dan hier</NuxtLink>
      </p>
    </div>
  </section>
</template>
