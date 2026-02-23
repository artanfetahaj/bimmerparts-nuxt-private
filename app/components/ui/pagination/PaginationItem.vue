<script setup lang="ts">
import type { PaginationListItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from "@vueuse/core"
import { PaginationListItem } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(defineProps<PaginationListItemProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  isActive?: boolean
}>(), {
  size: "icon",
})

const delegatedProps = reactiveOmit(props, "class", "size", "isActive")
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn(
      'inline-flex items-center justify-center h-9 min-w-9 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer',
      isActive
        ? 'bg-orange-500 text-white hover:bg-orange-600'
        : 'bg-transparent text-gray-700 hover:bg-gray-100',
      props.class
    )"
  >
    <slot />
  </PaginationListItem>
</template>
