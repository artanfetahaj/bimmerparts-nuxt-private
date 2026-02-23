<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from "."
import { computed } from "vue"

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
})

const componentTag = computed(() => props.to ? 'a' : props.as)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    class="button-nuxt-link"
  >
    <slot />
  </NuxtLink>
  <Primitive
    v-else
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
