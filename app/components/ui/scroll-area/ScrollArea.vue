<script setup lang="ts">
import type { ScrollAreaRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "reka-ui"
import { cn } from "@/lib/utils"
import ScrollBar from "./ScrollBar.vue"

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="cn('relative overflow-hidden', props.class)" style="display: flex; flex-direction: column;">
    <ScrollAreaViewport class="w-full rounded-[inherit] flex-1" style="overflow-y: auto; min-height: 0;">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
