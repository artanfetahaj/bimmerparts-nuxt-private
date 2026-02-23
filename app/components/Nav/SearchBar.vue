<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { Input } from '../ui/input'
import { useLocale } from '../../stores/locale'

const { t } = useLocale()
const searchQuery = ref('')
</script>

<template>
  <form role="search" class="relative w-full">
    <Input
      v-model="searchQuery"
      type="text"
      :placeholder="t('search.placeholder')"
      class="h-12 pl-4 pr-14 rounded-full text-[15px] text-gray-900 placeholder-gray-500 w-full bg-gray-50 border-gray-300"
    />
    <button
      type="submit"
      class="absolute flex items-center justify-center w-10 h-10 rounded-full right-1 top-1 bg-transparent text-gray-400 hover:text-gray-600"
    >
      <Search class="w-5 h-5" />
    </button>
  </form>
</template>
