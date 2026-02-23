<script setup lang="ts">
defineProps<{
  engines: any[]
  loading: boolean
  selected?: number
}>()

const emit = defineEmits<{
  (e: 'select', modelId: number): void
}>()
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold mb-2">Selecteer uitvoering</h3>

    <div v-if="loading">Laden...</div>

    <div v-else class="grid grid-cols-1 gap-2">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-3 py-2 text-left border-b">Uitvoering</th>
              <th class="px-3 py-2 text-left border-b">Motor</th>
              <th class="px-3 py-2 text-left border-b">Vanaf</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="engine in engines"
              :key="engine.id"
              @click="emit('select', engine.id)"
              :class="['cursor-pointer hover:bg-gray-50', selected === engine.id ? 'bg-blue-100' : '']"
            >
              <td class="px-3 py-2 border-b">{{ engine.name }}</td>
              <td class="px-3 py-2 border-b">{{ engine.car_engine.code }}</td>
              <td class="px-3 py-2 border-b">{{ engine.start_year }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
