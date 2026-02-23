<script setup lang="ts">
import { ref, watch } from 'vue'
import { CarModel, CarModelFilterKey } from '@/models/CarModel'
import SortableTable from '@/components/ui/sortable-table/SortableTable.vue'
import type { ColumnDef } from '@/components/ui/sortable-table/SortableTable.vue'

const props = defineProps<{
  series: string
  selectedModel: CarModel | null
}>()

const emit = defineEmits<{
  (e: 'update:selectedModel', model: CarModel): void
}>()

const models = ref<CarModel[]>([])
const loading = ref(false)
const error = ref(false)

const columns: ColumnDef<CarModel>[] = [
  { key: 'name',       label: 'Model',  cellClass: 'font-medium',            skeletonWidth: 'w-[160px]' },
  { key: 'code',       label: 'Code',   cellClass: 'text-gray-500 uppercase', skeletonWidth: 'w-[60px]'  },
  { key: 'start_year', label: 'Vanaf',  cellClass: 'text-gray-500',           skeletonWidth: 'w-[40px]'  },
]

async function fetchModels() {
  if (!props.series) return
  loading.value = true
  error.value = false
  try {
    const response = await new CarModel()
      .filter(CarModelFilterKey.SERIES, props.series)
      .all()
    models.value = Array.isArray(response) ? response : (response.data ?? [])
  } catch (e) {
    console.error(e)
    error.value = true
    models.value = []
  } finally {
    setTimeout(() => { loading.value = false }, 200)
  }
}

watch(() => props.series, fetchModels, { immediate: true })
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold mb-3">Selecteer model</h3>

    <SortableTable
      :rows="models"
      :columns="columns"
      :loading="loading"
      :error="error"
      :row-key="(row) => row.id"
      :is-row-selected="(row) => selectedModel?.id === row.id"
      search-placeholder="Zoek op model, code of jaar..."
      @row-click="emit('update:selectedModel', $event)"
    />
  </div>
</template>
