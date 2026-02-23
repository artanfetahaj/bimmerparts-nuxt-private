<script setup lang="ts">
import type { BmwModel } from '@/services/bmw'

defineProps<{
  models: BmwModel[]
  loading: boolean
  selected?: BmwModel
}>()

const emit = defineEmits<{
  (e: 'update:model', model: BmwModel): void
}>()

const selectModel = (model: BmwModel) => {
  emit('update:model', model) 
}
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
              <th class="px-3 py-2 text-left border-b">Brandstof</th>
            </tr>
          </thead>
          <tbody>
          <tr
            v-for="model in models"
            :key="model.id"
            @click="selectModel(model)"
            class="cursor-pointer transition"
            :class="{
              'border-orange-500 bg-orange-50': selected?.id === model.id,
              'hover:bg-gray-50': selected?.id !== model.id
            }"
          >
              <td class="px-3 py-2 border-b">{{ model.name }}</td>
              <td class="px-3 py-2 border-b">{{ model.code }}</td>
              <td class="px-3 py-2 border-b">{{ model.start_year }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>