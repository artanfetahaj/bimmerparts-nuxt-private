<script setup lang="ts">
import { ref, watch } from 'vue'
import { CarVariant, CarVariantFilterKey } from '@/models/CarVariant'
import SortableTable from '@/components/ui/sortable-table/SortableTable.vue'
import type { ColumnDef } from '@/components/ui/sortable-table/SortableTable.vue'

const props = defineProps<{
  modelId: string
  selectedVariantId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', variant: CarVariant): void
}>()

const variants = ref<CarVariant[]>([])
const loading = ref(false)
const error = ref(false)

const columns: ColumnDef<CarVariant>[] = [
  { key: 'name',       label: 'Uitvoering', cellClass: 'font-medium',             skeletonWidth: 'w-[140px]' },
  { key: 'engine',     label: 'Motor',      cellClass: 'text-gray-500 uppercase',  skeletonWidth: 'w-[50px]',
    getValue: (row) => row.car_engine?.code ?? null },
  { key: 'fuel_type',  label: 'Brandstof',  cellClass: 'text-gray-500 capitalize', skeletonWidth: 'w-[60px]'  },
  { key: 'start_year', label: 'Vanaf',      cellClass: 'text-gray-500',            skeletonWidth: 'w-[40px]'  },
]

async function fetchVariants() {
  if (!props.modelId) return
  loading.value = true
  error.value = false
  try {
    const response = await new CarVariant()
      .filter(CarVariantFilterKey.CAR_MODEL_ID, props.modelId)
      .all()
    variants.value = Array.isArray(response) ? response : (response.data ?? [])
  } catch (e) {
    console.error(e)
    error.value = true
    variants.value = []
  } finally {
    setTimeout(() => { loading.value = false }, 200)
  }
}

watch(() => props.modelId, fetchVariants, { immediate: true })
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold mb-3">Selecteer uitvoering</h3>

    <SortableTable
      :rows="variants"
      :columns="columns"
      :loading="loading"
      :error="error"
      :row-key="(row) => row.id"
      :is-row-selected="(row) => selectedVariantId === row.id"
      search-placeholder="Zoek op uitvoering, motor, brandstof..."
      @row-click="emit('select', $event)"
    />
  </div>
</template>
