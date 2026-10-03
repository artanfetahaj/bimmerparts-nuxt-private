<script setup lang="ts">
import { reactive, ref } from 'vue'
import { COOKIE_CATEGORIES, type ConsentCategory } from '@/composables/useCookieConsent'

const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent()

const showDetails = ref(false)
const choices = reactive<Record<ConsentCategory, boolean>>({ analytics: false, marketing: false })

// Start from the saved choice when the visitor reopens the settings
watch(showBanner, (visible) => {
  if (visible) {
    choices.analytics = consent.value.categories.analytics
    choices.marketing = consent.value.categories.marketing
  } else {
    showDetails.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-6 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-6 opacity-0"
    >
      <section
        v-if="showBanner"
        class="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[26rem] sm:p-0"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-text"
      >
        <div class="overflow-hidden rounded-2xl border border-white/10 border-l-4 border-l-orange-500 bg-zinc-900 text-white shadow-2xl shadow-black/40">
          <div class="p-5">
            <h2 id="cookie-title" class="font-heading text-lg font-bold uppercase tracking-wider">
              Cookies <span class="text-orange-500">&amp; privacy</span>
            </h2>
            <p id="cookie-text" class="mt-2 text-sm leading-relaxed text-zinc-300">
              We gebruiken noodzakelijke cookies om de webshop te laten werken. Met jouw toestemming plaatsen we ook
              cookies voor statistieken en marketing. Lees meer in ons
              <NuxtLink to="/privacy" class="text-orange-400 underline underline-offset-2 hover:text-orange-300">privacybeleid</NuxtLink>.
            </p>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <ul v-if="showDetails" class="mt-4 space-y-3 overflow-hidden">
                <li class="flex items-start justify-between gap-4 rounded-lg bg-white/5 p-3">
                  <div>
                    <p class="text-sm font-semibold">Noodzakelijk</p>
                    <p class="text-xs text-zinc-400">Winkelwagen, inloggen en beveiliging. Altijd actief.</p>
                  </div>
                  <span class="mt-0.5 shrink-0 text-xs font-medium text-zinc-400">Altijd aan</span>
                </li>
                <li v-for="cat in COOKIE_CATEGORIES" :key="cat.id" class="flex items-start justify-between gap-4 rounded-lg bg-white/5 p-3">
                  <div>
                    <p class="text-sm font-semibold">{{ cat.name }}</p>
                    <p class="text-xs text-zinc-400">{{ cat.description }}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="choices[cat.id]"
                    :aria-label="`${cat.name} ${choices[cat.id] ? 'uitzetten' : 'aanzetten'}`"
                    class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    :class="choices[cat.id] ? 'bg-orange-500' : 'bg-zinc-600'"
                    @click="choices[cat.id] = !choices[cat.id]"
                  >
                    <span
                      class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                      :class="choices[cat.id] ? 'translate-x-5' : ''"
                    />
                  </button>
                </li>
              </ul>
            </Transition>

            <!-- Accept and reject carry equal visual weight (AVG / Autoriteit Persoonsgegevens guidance) -->
            <div class="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                @click="acceptAll"
              >
                Alles accepteren
              </button>
              <button
                type="button"
                class="rounded-full border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                @click="rejectAll"
              >
                Alleen noodzakelijk
              </button>
            </div>

            <div class="mt-3 text-center">
              <button
                v-if="!showDetails"
                type="button"
                class="text-xs text-zinc-400 underline underline-offset-2 hover:text-white"
                @click="showDetails = true"
              >
                Instellingen aanpassen
              </button>
              <button
                v-else
                type="button"
                class="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                @click="savePreferences({ ...choices })"
              >
                Keuze opslaan
              </button>
            </div>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
