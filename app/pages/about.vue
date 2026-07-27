<script setup lang="ts">
useSeoMeta({
  title: 'Over ons | BimmerParts',
  description: 'BimmerParts is dé webshop voor liefhebbers van BMW en MINI. Leer meer over ons verhaal, onze passie en samenwerking met TOFFER Automotive.',
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- ── Hero ── -->
    <section class="bg-white pt-12 pb-0 overflow-hidden">
      <div class="container mx-auto px-6 md:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="pb-12 lg:pb-16 space-y-6">
            <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Over ons</span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
              Voor liefhebbers<br>van BMW & MINI
            </h1>
            <div class="w-12 h-1 bg-orange-500 rounded-full" />
            <p class="text-lg text-gray-600 leading-relaxed max-w-lg">
              BimmerParts is dé webshop voor liefhebbers van BMW en MINI. Van originele onderdelen en accessoires tot hoogwaardige aftermarket producten op het gebied van styling, performance en onderhoud: wij selecteren uitsluitend producten waar we zelf volledig achter staan.
            </p>
            <p class="text-lg text-gray-600 leading-relaxed max-w-lg">
              Onze passie voor BMW en MINI vormt de basis van alles wat we doen. Daarom vindt u bij ons niet alleen een uitgebreid assortiment, maar ook deskundig advies en onderdelen waarvan u zeker weet dat ze bij uw auto passen.
            </p>
            <NuxtLink
              to="/contact"
              class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-6 py-3 rounded-lg text-sm "
            >
              Neem contact op
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </NuxtLink>
          </div>
          <div class="relative pb-8">
            <img
              src="/images/about-us-banner.png"
              alt="BimmerParts — BMW & MINI onderdelen"
              class="w-full h-auto object-cover rounded-t-2xl lg:rounded-tl-2xl lg:rounded-tr-none shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── TOFFER partnership ── -->
    <section class="bg-gray-900 py-16">
      <div class="container mx-auto px-6 md:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Samenwerking</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white leading-tight">Meer dan een webshop</h2>
            <div class="w-10 h-1 bg-orange-500 rounded-full" />
          </div>
          <div class="space-y-4 text-gray-300 leading-relaxed">
            <p>BimmerParts werkt nauw samen met <strong class="text-white">TOFFER Automotive</strong>, een gespecialiseerde BMW & MINI werkplaats. Daardoor beschikken we over praktijkervaring die verder gaat dan alleen het verkopen van onderdelen. We sleutelen dagelijks aan BMW's en MINI's en weten uit eigen ervaring welke producten goed functioneren en welke oplossingen het beste resultaat bieden.</p>
            <p>Wilt u uw bestelling liever professioneel laten monteren? Ook dat is mogelijk via TOFFER Automotive. Zo heeft u één aanspreekpunt voor zowel het juiste onderdeel als de vakkundige montage.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Three pillars ── -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6 md:px-10">
        <div class="text-center mb-14 space-y-3">
          <span class="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Onze waarden</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">Waar we voor staan</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Kwaliteit staat voorop</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Ons assortiment bestaat uit zorgvuldig geselecteerde producten van gerenommeerde fabrikanten, aangevuld met een uitgebreid aanbod originele BMW- en MINI-onderdelen en accessoires. Wij kiezen bewust voor kwaliteit, betrouwbaarheid en een goede prijs-kwaliteitverhouding.</p>
            <p class="text-gray-600 text-sm leading-relaxed">Of u nu uw BMW of MINI wilt onderhouden, upgraden of een persoonlijker karakter wilt geven, bij BimmerParts bent u aan het juiste adres.</p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Persoonlijke service</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Wij geloven dat goede service begint met technische kennis en eerlijk advies. Heeft u vragen over de juiste onderdelen, twijfelt u over de compatibiliteit of bent u op zoek naar een specifiek product? Dan denken wij graag met u mee.</p>
            <p class="text-gray-600 text-sm leading-relaxed">Voor vragen kunt u het beste gebruikmaken van het contactformulier op onze website. Vermeld daarbij bij voorkeur uw kenteken of chassisnummer (VIN), aangevuld met informatie over uw BMW of MINI en uw vraag. Zo kunnen wij direct controleren welke onderdelen geschikt zijn.</p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6 text-orange-500">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Groeiend assortiment</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Ons assortiment groeit voortdurend. Staat het onderdeel dat u zoekt nog niet online? Neem gerust contact met ons op. In veel gevallen kunnen wij het alsnog leveren.</p>
            <p class="text-gray-600 text-sm leading-relaxed">Bij BimmerParts combineren we de kennis van de werkplaats met het gemak van online bestellen. Zo bent u verzekerd van de juiste onderdelen én deskundig advies.</p>
          </div>

        </div>
      </div>
    </section>


  </div>
</template>
