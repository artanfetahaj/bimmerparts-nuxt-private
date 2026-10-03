<script setup lang="ts">
const services = [
  {
    icon: 'wrench',
    title: 'Motoronderdelen',
    description: 'Distributieriemen, waterpomp, thermostaat, bougies en meer.',
  },
  {
    icon: 'brake',
    title: 'Remmen & wielophanging',
    description: 'Remschijven, remblokken, veerpoten, lagers en roterende delen.',
  },
  {
    icon: 'oil',
    title: 'Vloeistoffen & filters',
    description: 'Olie-, lucht-, brandstof- en polenfilters met volledige service.',
  },
  {
    icon: 'electric',
    title: 'Elektronica & verlichting',
    description: 'Accu, dynamo, startmotor, sensoren en volledige verlichtingsets.',
  },
  {
    icon: 'body',
    title: 'Carrosserie & exterieur',
    description: 'Spiegels, grilles, bumpers, spoilers en trim-onderdelen.',
  },
  {
    icon: 'gear',
    title: 'Transmissie & aandrijving',
    description: 'Koppeling, versnellingsbak, cardan en aandrijfassen.',
  },
]
</script>

<template>
  <section class="w-full  py-20 overflow-hidden">
    <div class="outer-container">

      <!-- Two-column layout: copy left, visual right -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

        <!-- LEFT — copy -->
        <div>
          <p class="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Montage in de garage
          </p>

          <h2 class="text-gray-900 font-black text-3xl sm:text-4xl leading-tight mb-4">
            Onderdeel besteld?<br>
            <span class="text-orange-500">Laat het direct monteren.</span>
          </h2>

          <p class="text-gray-500 text-base leading-relaxed mb-8 max-w-lg">
            Via onze partner <a href="https://tofferautomotive.nl/" target="_blank" rel="noopener" class="text-gray-800 font-semibold underline decoration-orange-500 underline-offset-4 hover:text-orange-500 transition-colors">TOFFER Automotive</a> kunt u het
            bestelde onderdeel direct laten monteren door BMW&nbsp;&amp;&nbsp;MINI specialisten.
            Één aanspreekpunt — van het juiste onderdeel tot vakkundige installatie.
          </p>

          <!-- Key points -->
          <ul class="space-y-3 mb-10">
            <li
              v-for="point in ['BMW & MINI gecertificeerde monteurs', 'Volledig gegarandeerd vakmanschap', 'Geen extra zoekwerk — wij leveren het onderdeel']"
              :key="point"
              class="flex items-start gap-3 text-sm text-gray-600"
            >
              <span class="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/10 shrink-0">
                <svg class="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {{ point }}
            </li>
          </ul>

          <!-- CTA -->
          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-zinc-900 text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Montage aanvragen
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/over-ons"
              class="inline-flex items-center gap-2 text-gray-700 hover:text-orange-500 text-sm font-semibold transition-colors"
            >
              Meer over TOFFER Automotive
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- RIGHT — service grid -->
        <div class="relative">
          <!-- Decorative background blob -->
          <div class="absolute -inset-6 bg-orange-500/5 rounded-3xl -z-10" />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="service in services"
              :key="service.title"
              class="flex items-start gap-3  border border-gray-100 rounded-xl p-4 shadow-sm hover:border-orange-200 hover:shadow-md transition-all duration-200"
            >
              <!-- Icon -->
              <div class="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <!-- Wrench -->
                <svg v-if="service.icon === 'wrench'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <!-- Brake / disc -->
                <svg v-else-if="service.icon === 'brake'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                </svg>
                <!-- Oil drop -->
                <svg v-else-if="service.icon === 'oil'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/>
                </svg>
                <!-- Lightning / electric -->
                <svg v-else-if="service.icon === 'electric'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <!-- Body / car -->
                <svg v-else-if="service.icon === 'body'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/>
                  <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                </svg>
                <!-- Gear -->
                <svg v-else-if="service.icon === 'gear'" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>

              <!-- Text -->
              <div>
                <p class="text-sm font-semibold text-gray-800 leading-snug">{{ service.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ service.description }}</p>
              </div>
            </div>
          </div>

          <!-- TOFFER badge -->
          <a href="https://tofferautomotive.nl/" target="_blank" rel="noopener" class="mt-5 flex items-center gap-3 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl px-5 py-3.5">
            <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold leading-none">TOFFER Automotive</p>
              <p class="text-xs text-white/50 mt-0.5">Officieel montagepartner van BimmerParts</p>
            </div>
            <span class="shrink-0 text-xs font-medium bg-orange-500 text-zinc-900 rounded-full px-3 py-1">
              Partner
            </span>
          </a>
        </div>

      </div>
    </div>
  </section>
</template>
