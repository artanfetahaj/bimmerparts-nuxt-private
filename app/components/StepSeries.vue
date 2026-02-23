<script setup lang="ts">
interface SeriesItem {
  name: string
  image: string
}

const props = defineProps<{
  seriesList: SeriesItem[]
  series: string
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:series', value: string): void
}>()

const selectSeries = (value: string) => {
  emit('update:series', value)
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-6">
      Laden...
    </div>

    <div v-else class="grid grid-cols-3 md:grid-cols-4 gap-6">
      <button
        v-for="item in seriesList"
        :key="item.name"
        @click="selectSeries(item.name)"
        class="relative group"
      >
        <div
          :class="[
            'rounded-xl border-2 p-4 transition-all duration-200',
            series === item.name
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-400'
          ]"
        >
          <img
            :src="item.image"
            :alt="item.name"
            class="w-full h-20 object-contain mb-3"
          />

          <p
            class="text-center font-semibold text-gray-700 group-hover:text-black"
          >
            {{ item.name }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>