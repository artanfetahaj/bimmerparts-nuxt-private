<script setup lang="ts">
useSeoMeta({
  title: 'Eventuri | BimmerParts',
  description: 'Eventuri performance carbon luchtinlaatsystemen, turbo-inlaten en motorkappen voor BMW en MINI. Engineered for maximum airflow.',
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- ── Hero ── -->
    <section class="bg-white pt-12 pb-0 overflow-hidden">
      <div class="container mx-auto px-6 md:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="pb-12 lg:pb-16 space-y-6">
            <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Partnermerk</span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
              Over<br>Eventuri
            </h1>
            <div class="w-12 h-1 bg-orange-500 rounded-full" />
            <p class="text-lg text-gray-600 leading-relaxed max-w-lg">
              Eventuri is opgericht door een team van ingenieurs en enthousiastelingen met een achtergrond in luchtvaart en tuning — allemaal met een gedeelde passie voor auto's en prestaties.
            </p>
            <p class="text-gray-600 leading-relaxed max-w-lg">
              Na jarenlang verschillende air intakes voor eigen auto's te hebben geprobeerd en teleurstelling over de prestatiewinsten, besloten ze het heft in eigen handen te nemen en het boek te herschrijven. Bovenal om een nieuwe maatstaf te stellen op het gebied van het ontwerp en de technologie van de inlaat, om systemen te ontwikkelen die echte winst opleveren en vervolgens om echte cijfers te publiceren.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                to="/products?brand=Eventuri"
                class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-6 py-3 rounded-lg text-sm"
              >
                Bekijk alle Eventuri producten
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center justify-center p-8 lg:p-12">
            <NuxtImg
              src="/images/Eventuri-logo.png"
              alt="Eventuri"
              class="max-w-sm w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Methodology ── -->
    <section class="bg-gray-900 py-16">
      <div class="container mx-auto px-6 md:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div class="space-y-4">
            <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Ontwikkeld voor prestaties</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white leading-tight">Ontwikkeld met precisie</h2>
            <div class="w-10 h-1 bg-orange-500 rounded-full" />
          </div>
          <div class="space-y-4 text-gray-300 leading-relaxed">
            <p>Eventuri systemen zijn uitgebreid ontwikkeld met behulp van geavanceerde ontwerp-, test- en prototypingmethoden. Met de focus op prestaties ondergaat elk ontwerp een <strong class="text-white">CFD-analyse</strong> en wordt vervolgens in de prototypefase gevalideerd door middel van volumetrische luchtstroom, inlaattemperatuur en uitgebreide testen op de rollenbank.</p>
            <p>Voor elk onderdeel worden alleen de beste materialen geselecteerd — tot en met de keuze van bevestigingsmiddelen en bevestigingen — om ervoor te zorgen dat de kwaliteit van het eindproduct ongeëvenaard is.</p>
            <p>Na vele jaren van teleurstelling over de gebruikelijke aftermarket-inlaatsystemen, is Eventuri er trots op de lat hoger te leggen en inlaatsystemen te creëren die een nieuwe standaard zetten en de prestaties van uw voertuig daadwerkelijk verbeteren.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Product categories ── -->
    <section class="bg-gray-50 py-20">
      <div class="container mx-auto px-6 md:px-10">
        <div class="text-center mb-14 space-y-3">
          <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Productcategorieën</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Wat Eventuri biedt</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Carbon Intakes -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M20 2v4h-4"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Performance Carbon Luchtinlaatsystemen</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Eventuri-inlaatsystemen zijn uitgebreid ontwikkeld met behulp van geavanceerde ontwerp-, test- en prototypingmethoden om een efficiënter stroompad naar de motor te bieden in vergelijking met het OEM-systeem. Elk systeem is voorzien van het gepatenteerde <strong>Venturi-behuizingsconcept</strong> van Eventuri om de luchtstroom te vergemakkelijken en de weerstand van het systeem te verminderen.
            </p>
          </div>

          <!-- Turbo Inlets -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12 2.1 9.1"/><path d="m12 12 5.9 8.1"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Turbo-inlaten / buizen & Chargepipes</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Eventuri heeft maandenlang intensief onderzoek en ontwikkeling geïnvesteerd in de ontwikkeling van turbo-inlaten/buizen en laadpijpen die geen ruimte laten voor compromissen en de perfecte aanvulling zijn op hun inlaatsysteem. Deze aanvullende producten zijn ontworpen om het stroomvolume te vergroten en verdere prestatieverbeteringen te bieden.
            </p>
          </div>

          <!-- Plenum covers -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Carbon lucht-verdeelhuis afdekkingen</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              De Eventuri koolstofvezel lucht-verdeelhuis afdekkingen zijn gemaakt van 100% hoogwaardig prepreg-koolstof, inclusief de interne trompetten, en vervangt de standaard plastic versie om het gebrul van de atmosferische BMW-motor te ontketenen. Hoewel het koolstofplenum geen prestatiewinst oplevert, tilt het gegenereerde inductiegeluid de rijervaring naar een geheel nieuw niveau.
            </p>
          </div>

          <!-- Engine covers -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Carbon motor afdekkingen</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Uw voertuig verdient een motorruimte die er net zo goed uitziet als hij presteert. Eventuri heeft de motorkap voor talloze voertuigen opnieuw ontworpen om een werkelijk aantrekkelijk uiterlijk te bieden dat de motorruimte transformeert. Gemaakt van prepreg-koolstofvezel als directe vervanging voor de OEM-afdekking.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="bg-white py-16">
      <div class="container mx-auto px-6 md:px-10 text-center space-y-6">
        <h2 class="text-3xl font-bold text-gray-900">Welke Eventuri upgrade past bij jouw BMW of MINI?</h2>
        <p class="text-gray-600 max-w-xl mx-auto">Bekijk ons volledige Eventuri assortiment en vind de upgrade die past bij jouw model.</p>
        <NuxtLink
          to="/products?brand=Eventuri"
          class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold px-8 py-4 rounded-lg"
        >
          Bekijk alle Eventuri producten
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>
