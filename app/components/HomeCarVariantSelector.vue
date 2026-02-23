<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import LicensePlateInput from '@/components/inputs/LicensePlateInput.vue'
import VinInput from '@/components/inputs/VinInput.vue'
import type { CarVariant } from '@/models/CarVariant'

const emit = defineEmits<{
  (e: 'selectModel'): void
}>()

const showVin = ref(false)

function handleSuccess(_variant: CarVariant) {
  // Store + router already updated inside the input components.
  // Add any page-level side-effects here if needed (e.g. scroll, toast).
}
</script>

<template>
  <div class="w-full max-w-[460px] space-y-2.5">

    <!-- Card -->
    <div class="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/20">

      <!-- Body -->
      <div class="bg-white/10 backdrop-blur-md px-5 pt-5 pb-4 space-y-4">

        <!-- Step indicator -->
        <div class="flex items-center gap-2">
          <span class="text-white font-semibold text-sm">Voer je kenteken in</span>
        </div>

        <!-- License plate -->
        <LicensePlateInput theme="dark" @success="handleSuccess" />

        <!-- Divider with VIN toggle -->
        <div class="flex items-center gap-2.5 pt-1">
          <div class="flex-1 h-px bg-white/15" />
          <button
            class="flex items-center gap-1 text-white/45 hover:text-white/75 text-[11px] font-medium uppercase tracking-wider transition-colors py-0.5"
            @click="showVin = !showVin"
          >
            Of chassisnummer (VIN)
            <ChevronDown
              class="h-3 w-3 transition-transform duration-200"
              :class="{ 'rotate-180': showVin }"
            />
          </button>
          <div class="flex-1 h-px bg-white/15" />
        </div>

        <!-- VIN input — collapsible -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <VinInput v-if="showVin" theme="dark" @success="handleSuccess" />
        </Transition>

      </div>
    </div>

    <!-- Manual model selector -->
    <div class="flex justify-center">
      <Button
        variant="link"
        size="sm"
        class="text-white"
        @click="emit('selectModel')"
      >
        Of selecteer uw model handmatig
      </Button>
    </div>

  </div>
</template>
