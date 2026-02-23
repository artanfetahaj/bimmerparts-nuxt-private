<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  variant: 'purple' | 'green'
  onPrev: () => void
  onNext: () => void
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex gap-3">
    <!-- Previous Button - Always white with black left arrow -->
    <Button
      variant="default"
      size="icon-lg"
      @click="props.onPrev"
      class="rounded-full hover:scale-105 transition-transform bg-white text-dark-purple hover:bg-white/90"
    >
      <img src="~assets/icons/black-nav-arrow-left.svg" class="w-4 h-4 pointer-events-none" alt="Previous" />
    </Button>
    
    <!-- Next Button - Purple variant with white arrow -->
    <Button
      v-if="props.variant === 'purple'"
      variant="dark-purple"
      size="icon-lg"
      @click="props.onNext"
      class="rounded-full hover:scale-105 transition-transform"
    >
      <img src="~assets/icons/white-nav-arrow-right.svg" class="w-4 h-4 pointer-events-none" alt="Next" />
    </Button>
    
    <!-- Next Button - Green variant with black arrow -->
    <Button
      v-if="props.variant === 'green'"
      variant="green"
      size="icon-lg"
      @click="props.onNext"
      class="rounded-full hover:scale-105 transition-transform"
    >
      <img src="~assets/icons/black-nav-arrow-right.svg" class="w-4 h-4 pointer-events-none" alt="Next" />
    </Button>
  </div>
</template>
