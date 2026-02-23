<script setup lang="ts">
import type { PaginationFirstProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from "@vueuse/core"
import { ChevronLeftIcon } from "lucide-vue-next"
import { PaginationFirst, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(defineProps<PaginationFirstProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  size: "default",
})

const delegatedProps = reactiveOmit(props, "class", "size")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationFirst
    data-slot="pagination-first"
    :class="cn('inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md transition-colors cursor-pointer text-gray-700 hover:bg-gray-100 gap-1', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronLeftIcon />
      <span class="hidden sm:block">First</span>
    </slot>
  </PaginationFirst>
</template>
