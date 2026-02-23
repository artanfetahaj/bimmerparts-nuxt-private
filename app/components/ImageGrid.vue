<script setup lang="ts">
interface GridImage {
  src: string
  alt?: string
  caption?: string
}

defineProps<{ images: GridImage[] }>()
</script>

<template>
  <section id="products" class="container mx-auto px-6 md:px-10 py-10 md:py-14">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <figure v-for="(img, idx) in images" :key="idx" class="group relative overflow-hidden rounded-lg bg-gray-100">
        <img :src="img.src" :alt="img.alt ?? 'Product'" class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
        <figcaption v-if="img.caption" class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm px-3 py-2">
          {{ img.caption }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
</style>


