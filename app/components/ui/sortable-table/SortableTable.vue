<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'

// ─── Column definition ────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key, also used as sort key */
  key: string
  /** Header label */
  label: string
  /** Resolve the comparable/display value for a row (defaults to row[key]) */
  getValue?: (row: T) => string | number | null | undefined
  /** Extra classes on the <TableCell> */
  cellClass?: string
  /** Extra classes on the <TableHead> */
  headClass?: string
  /** Width hint for the skeleton placeholder, e.g. 'w-[160px]' */
  skeletonWidth?: string
  /** Set false to disable sorting on this column (default: true) */
  sortable?: boolean
}

// ─── Props / emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  rows: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  error?: boolean
  skeletonRows?: number
  rowKey: (row: T) => string
  isRowSelected?: (row: T) => boolean
  searchPlaceholder?: string
}>(), {
  loading: false,
  error: false,
  skeletonRows: 8,
  searchPlaceholder: 'Zoeken...',
})

const emit = defineEmits<{
  (e: 'rowClick', row: T): void
}>()

// ─── Search ───────────────────────────────────────────────────────────────────

const search = ref('')

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc' | null
const sortKey = ref<string | null>(null)
const sortDir = ref<SortDir>(null)

function toggleSort(key: string) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortKey.value = null
    sortDir.value = null
  }
}

// ─── Filtered + sorted rows ───────────────────────────────────────────────────

const processedRows = computed(() => {
  const q = search.value.trim().toLowerCase()

  let result = props.rows

  // Filter: match query against every column's resolved value
  if (q) {
    result = result.filter(row =>
      props.columns.some(col => {
        const val = resolveValue(col, row)
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }

  // Sort
  if (sortKey.value && sortDir.value) {
    const col = props.columns.find(c => c.key === sortKey.value)
    result = [...result].sort((a, b) => {
      const aVal = col ? resolveValue(col, a) : a[sortKey.value!]
      const bVal = col ? resolveValue(col, b) : b[sortKey.value!]

      const aStr = aVal == null ? '' : String(aVal).toLowerCase()
      const bStr = bVal == null ? '' : String(bVal).toLowerCase()

      const aNum = Number(aStr)
      const bNum = Number(bStr)
      const numeric = !isNaN(aNum) && !isNaN(bNum) && aStr !== '' && bStr !== ''

      const cmp = numeric ? aNum - bNum : aStr.localeCompare(bStr, 'nl')
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }

  return result
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveValue(col: ColumnDef<T>, row: T): string | number | null | undefined {
  return col.getValue ? col.getValue(row) : row[col.key]
}

function isSortable(col: ColumnDef<T>) {
  return col.sortable !== false
}
</script>

<template>
  <div class="flex flex-col gap-3">

    <!-- ── Search bar ── -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        v-model="search"
        :placeholder="searchPlaceholder"
        class="pl-9 pr-9 h-9 text-sm bg-muted"
      />
      <button
        v-if="search"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        @click="search = ''"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- ── Skeleton ── -->
    <div v-if="loading">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="col in columns" :key="col.key" :class="col.headClass">
              {{ col.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="n in skeletonRows" :key="n">
            <TableCell v-for="col in columns" :key="col.key">
              <Skeleton :class="`h-4 ${col.skeletonWidth ?? 'w-[100px]'}`" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- ── Error ── -->
    <p v-else-if="error" class="text-sm text-red-500 py-4">
      Er is iets misgegaan. Probeer het opnieuw.
    </p>

    <!-- ── Table ── -->
    <template v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              v-for="col in columns"
              :key="col.key"
              :class="[col.headClass, isSortable(col) ? 'cursor-pointer select-none hover:text-gray-900 transition-colors' : '']"
              @click="isSortable(col) ? toggleSort(col.key) : undefined"
            >
              <div class="flex items-center gap-1.5">
                <span>{{ col.label }}</span>
                <template v-if="isSortable(col)">
                  <ArrowUp    v-if="sortKey === col.key && sortDir === 'asc'"  class="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <ArrowDown  v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </template>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Empty state -->
          <TableRow v-if="processedRows.length === 0">
            <TableCell :colspan="columns.length" class="text-center text-sm text-gray-400 py-8">
              {{ search ? `Geen resultaten voor "${search}"` : 'Geen gegevens beschikbaar.' }}
            </TableCell>
          </TableRow>

          <!-- Data rows -->
          <TableRow
            v-for="row in processedRows"
            v-else
            :key="rowKey(row)"
            class="cursor-pointer"
            :class="isRowSelected?.(row) ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'"
            @click="emit('rowClick', row)"
          >
            <TableCell
              v-for="col in columns"
              :key="col.key"
              :class="col.cellClass"
            >
              <!-- Named slot per column for custom rendering, falls back to resolved value -->
              <slot :name="`cell-${col.key}`" :row="row" :value="resolveValue(col, row)">
                {{ resolveValue(col, row) ?? '—' }}
              </slot>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Result count when actively filtering -->
      <p v-if="search && processedRows.length > 0" class="text-xs text-gray-400 text-right -mt-1">
        {{ processedRows.length }} van {{ rows.length }} resultaten
      </p>
    </template>

  </div>
</template>
