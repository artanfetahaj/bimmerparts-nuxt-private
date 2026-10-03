<script setup lang="ts">
import { computed, ref } from 'vue'
import { CarModel, CarModelIncludes } from '@/models/CarModel'
import { BMW_SERIES } from '@/collections/bmw-series'
import type { CarVariant } from '@/models/CarVariant'
import type { CarModel as CarModelType } from '@/models/CarModel'
import { useCarVariantStore } from '@/stores/car-variant.store'

const carVariantStore = useCarVariantStore()

useHead({
  title: 'BMW Model Codes – Alle Series, Modellen en Uitvoeringen | BimmerParts',
  meta: [
    {
      name: 'description',
      content:
        'Overzicht van alle BMW model codes, series, modellen en uitvoeringen. Vind snel de juiste BMW-onderdelen op basis van jouw serie, model en uitvoering.',
    },
    { property: 'og:title', content: 'BMW Model Codes – BimmerParts' },
    {
      property: 'og:description',
      content:
        'Volledig overzicht van alle BMW series, modellen en uitvoeringen. Kies jouw BMW en bekijk direct de beschikbare onderdelen.',
    },
  ],
})

const { data: allModels, pending } = useAsyncData('bmw-model-codes', async () => {
  const result = await new CarModel().include(CarModelIncludes.VARIANTS).all()
  const models = Array.isArray(result) ? result : (result?.data ?? [])
  return JSON.parse(JSON.stringify(models))
})

const search = ref('')

const modelsBySeries = computed(() => {
  const q = search.value.toLowerCase().trim()
  const map = new Map<string, typeof allModels.value>()

  for (const series of BMW_SERIES) {
    const models = (allModels.value ?? []).filter((m) => {
      if (m.series !== series.series) return false
      if (!q) return true
      const matchModel = m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
      const matchVariant = m.variants?.some(
        (v) =>
          v.full_name.toLowerCase().includes(q) ||
          v.car_engine?.code?.toLowerCase().includes(q),
      )
      return matchModel || matchVariant
    })
    if (models.length) map.set(series.series, models)
  }
  return map
})

const activeSeries = ref<string | null>(null)

function scrollToSeries(series: string) {
  activeSeries.value = series
  const el = document.getElementById(`series-${series.replace(/\s+/g, '-')}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Real <NuxtLink>s navigate (and are crawlable); these only sync the selected car into the store.
function selectVariant(variant: CarVariant) {
  carVariantStore.setVariant(variant)
}

function selectModel(model: CarModelType) {
  carVariantStore.setModel(model)
}

function seriesId(series: string) {
  return `series-${series.replace(/\s+/g, '-')}`
}

function yearRange(start?: number, end?: number) {
  if (!start) return ''
  return end ? `${start} – ${end}` : `${start} –`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div class="container mx-auto px-6 md:px-10 py-16 md:py-20">
        <p class="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3">BimmerParts</p>
        <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-4">
          BMW Model Codes
        </h1>
        <p class="text-gray-300 text-lg max-w-2xl leading-relaxed">
          Volledig overzicht van alle BMW series, modellen en uitvoeringen.
          Kies jouw BMW en bekijk direct de beschikbare onderdelen.
        </p>

        <!-- Search -->
        <div class="mt-8 max-w-md">
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              v-model="search"
              type="search"
              placeholder="Zoek op model, code of uitvoering…"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Series nav bar ────────────────────────────────────────────────────── -->
    <div class="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-6 md:px-10">
        <div class="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          <button
            v-for="s in BMW_SERIES"
            :key="s.series"
            class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
            :class="activeSeries === s.series
              ? 'bg-orange-500 text-zinc-900'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            @click="scrollToSeries(s.series)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Loading ───────────────────────────────────────────────────────────── -->
    <div v-if="pending" class="container mx-auto px-6 md:px-10 py-20 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-gray-400">
        <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span class="text-sm">Modellen laden…</span>
      </div>
    </div>

    <!-- ── No results ────────────────────────────────────────────────────────── -->
    <div v-else-if="modelsBySeries.size === 0" class="container mx-auto px-6 md:px-10 py-20 text-center text-gray-400">
      <p class="text-lg font-medium">Geen modellen gevonden voor "{{ search }}"</p>
      <button class="mt-4 text-sm text-orange-500 hover:underline" @click="search = ''">Zoekopdracht wissen</button>
    </div>

    <!-- ── Series sections ───────────────────────────────────────────────────── -->
    <div v-else class="container mx-auto px-6 md:px-10 py-10 space-y-16">
      <template v-for="s in BMW_SERIES" :key="s.series">
        <section
          v-if="modelsBySeries.has(s.series)"
          :id="seriesId(s.series)"
          class="scroll-mt-[64px]"
        >
          <!-- Series header -->
          <div class="flex items-center gap-5 mb-6">
            <NuxtImg
              :src="s.image"
              :alt="s.label"
              width="120"
              height="70"
              class="object-contain w-[100px] h-[60px] drop-shadow"
            />
            <div>
              <h2 class="text-2xl font-bold text-gray-900">BMW {{ s.label }}</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ modelsBySeries.get(s.series)!.length }} modellen</p>
            </div>
          </div>

          <!-- Models grid -->
          <div class="grid grid-cols-1 gap-6">
            <article
              v-for="model in modelsBySeries.get(s.series)"
              :key="model.id"
              class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <!-- Model header -->
              <div class="flex items-center gap-4 p-5 border-b border-gray-100">
                <NuxtImg
                  :src="`/car-models/${model.code}.png`"
                  :alt="model.name"
                  width="160"
                  height="90"
                  class="object-contain w-[130px] h-[75px] shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-bold text-gray-900 leading-tight">{{ model.name }}</h3>
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ model.code }}</span>
                    <span v-if="model.generation" class="text-xs text-gray-400">{{ model.generation }}</span>
                    <span v-if="model.type" class="text-xs text-gray-400">{{ model.type }}</span>
                    <span v-if="model.start_year" class="text-xs text-gray-400">{{ yearRange(model.start_year, model.end_year) }}</span>
                  </div>
                </div>
                <NuxtLink
                  :to="{ path: '/producten', query: { car_model: String(model.id) } }"
                  class="shrink-0 ml-auto text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-colors"
                  @click="selectModel(model)"
                >
                  Alle uitvoeringen
                </NuxtLink>
              </div>

              <!-- Variants table -->
              <div v-if="model.variants && model.variants.length" class="divide-y divide-gray-50">
                <NuxtLink
                  v-for="variant in model.variants"
                  :key="variant.id"
                  :to="{ path: '/producten', query: { car: variant.id } }"
                  class="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-orange-50 transition-colors group"
                  @click="selectVariant(variant)"
                >
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                      {{ variant.full_name }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 shrink-0 text-xs text-gray-400">
                    <span v-if="variant.car_engine?.code" class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{ variant.car_engine.code }}</span>
                    <span v-if="variant.fuel_type" class="capitalize">{{ variant.fuel_type }}</span>
                    <span v-if="variant.start_year">{{ yearRange(variant.start_year, variant.end_year) }}</span>
                    <svg class="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </NuxtLink>
              </div>
              <div v-else class="px-5 py-3 text-xs text-gray-400 italic">
                Geen uitvoeringen beschikbaar.
              </div>
            </article>
          </div>
        </section>
      </template>
    </div>

  </div>
</template>
