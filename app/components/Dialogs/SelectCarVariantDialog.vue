<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check, RefreshCw } from 'lucide-vue-next'
import { useCarVariantStore } from '@/stores/car-variant.store'
import type { CarModel } from '@/models/CarModel'
import type { CarVariant } from '@/models/CarVariant'
import { getSeriesImage, getSeriesLabel } from '@/collections/bmw-series'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperTrigger,
} from '@/components/ui/stepper'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import StepSelectSeries from './steps/StepSelectSeries.vue'
import StepSelectModel from './steps/StepSelectModel.vue'
import StepSelectVariant from './steps/StepSelectVariant.vue'

const store  = useCarVariantStore()
const router = useRouter()

const currentStep       = ref(1)
const selectedSeries    = ref('')
const selectedModel     = ref<CarModel | null>(null)
const selectedVariantId = ref<string | null>(null)

const showStepper = computed(() => !store.selectedVariant)

const steps = [
  { step: 1, title: 'Serie',      description: 'Kies jouw BMW serie'  },
  { step: 2, title: 'Model',      description: 'Kies het model'      },
  { step: 3, title: 'Uitvoering', description: 'Kies de uitvoering'  },
]

const isLastStep = computed(() => currentStep.value === steps.length)

const stepCompleted = computed(() => ({
  1: !!selectedSeries.value,
  2: !!selectedModel.value,
  3: false,
}))

function isStepDisabled(step: number): boolean {
  for (let i = 1; i < step; i++) {
    if (!stepCompleted.value[i as 1 | 2 | 3]) return true
  }
  return false
}

const canGoNext = computed(() => {
  if (currentStep.value === 1) return stepCompleted.value[1]
  if (currentStep.value === 2) return stepCompleted.value[2]
  return true
})

function nextStep() {
  if (!canGoNext.value || isLastStep.value) return
  if (currentStep.value === 1) selectedModel.value = null
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function handleStepperChange(step: number) {
  if (isStepDisabled(step)) return
  currentStep.value = step
}

function handleVariantSelect(variant: CarVariant) {
  store.setVariant(variant)
  resetStepperState()
  router.push({ path: '/products', query: { car: variant.id } })
}

function handleChangeVariant() {
  store.clearVariant()
  const { car: _removed, ...rest } = route.query
  router.replace({ query: rest })
  resetStepperState()
}

function resetStepperState() {
  currentStep.value = 1
  selectedSeries.value = ''
  selectedModel.value = null
  selectedVariantId.value = null
}

function handleOpenChange(open: boolean) {
  if (!open) {
    store.closeDialog()
    resetStepperState()
  }
}

function handleVariantResolved(variant: CarVariant) {
  // store.setVariant + router already handled inside LicensePlateInput / VinInput
  // Just close the dialog and reset
  store.closeDialog()
  resetStepperState()
}
</script>

<template>
  <Dialog :open="store.isDialogOpen" @update:open="handleOpenChange">
    <DialogContent class="max-w-[800px] w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]" :close-class="!showStepper ? 'text-white' : ''">

      <!-- ════════════════════════════════════════════════════════
           SELECTED CAR VIEW
      ═════════════════════════════════════════════════════════ -->
      <template v-if="!showStepper">
        <div class="flex flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-300">

          <!-- Hero: gradient backdrop + big car image -->
          <div class="relative w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">

            <!-- Subtle radial glow behind the car -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-[480px] h-[480px] rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            <!-- Series label top-left -->
            <div class="absolute top-5 left-6 animate-in fade-in-0 slide-in-from-left-3 duration-500 delay-100">
              <span class="text-xs font-semibold tracking-widest text-orange-400 uppercase">
                BMW {{ getSeriesLabel(store.selectedVariant!.car_model?.series) }}
              </span>
            </div>

            <!-- Car image -->
            <div class="relative flex items-center justify-center px-8 pt-14 pb-6 animate-in fade-in-0 zoom-in-95 duration-500 delay-75">
              <NuxtImg
                :src="`/car-models/${store.selectedVariant!.car_model?.code}.png`"
                :alt="store.selectedVariant!.full_name"
                width="520"
                height="280"
                class="object-contain w-full max-w-[520px] h-auto drop-shadow-2xl"
              />
            </div>

            <!-- Name + meta overlay at the bottom of the hero -->
            <div class="relative px-6 pb-6 flex flex-col gap-1 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 delay-100">
              <h2 class="text-2xl font-bold tracking-tight text-white leading-tight">
                {{ store.selectedVariant!.full_name }}
              </h2>
              <p class="text-sm text-gray-400">
                {{ store.selectedVariant!.car_model?.name }}
                <template v-if="store.selectedVariant!.car_model?.generation">
                  &middot; {{ store.selectedVariant!.car_model?.generation }}
                </template>
              </p>
            </div>
          </div>

          <!-- Details row -->
          <div class="px-6 py-5 flex items-center gap-6 border-b border-gray-100 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-150">
            <div v-if="store.selectedVariant!.car_model?.code" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Motor</span>
              <span class="text-sm font-semibold text-gray-900 uppercase">{{ store.selectedVariant!.car_engine?.code }}</span>
            </div>
            <div v-if="store.selectedVariant!.car_model?.type" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Type</span>
              <span class="text-sm font-semibold text-gray-900">{{ store.selectedVariant!.car_model?.type }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Serie</span>
              <span class="text-sm font-semibold text-gray-900">{{ getSeriesLabel(store.selectedVariant!.car_model?.series) }}</span>
            </div>
            <div v-if="store.selectedVariant!.car_model?.generation" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Generatie</span>
              <span class="text-sm font-semibold text-gray-900">{{ store.selectedVariant!.car_model?.generation }}</span>
            </div>
            <div v-if="store.selectedVariant!.start_year" class="flex flex-col gap-0.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Bouwjaar</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ store.selectedVariant!.start_year }}
                <template v-if="store.selectedVariant!.end_year">– {{ store.selectedVariant!.end_year }}</template>
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-4 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-200">
            <Button
              variant="outline"
              class="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="handleOpenChange(false)"
            >
              Sluiten
            </Button>
            <Button
              class="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white gap-2"
              @click="handleChangeVariant"
            >
              <RefreshCw class="w-4 h-4" />
              Andere BMW kiezen
            </Button>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════════════════════
           STEPPER / SELECTION VIEW
      ═════════════════════════════════════════════════════════ -->
      <template v-else>
        <!-- Fixed header -->
        <DialogHeader class="shrink-0 px-6 pt-6 pb-5 border-b animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <DialogTitle class="text-base font-semibold text-gray-900 mb-5">
            Kies jouw BMW model voor geschikte onderdelen.
          </DialogTitle>

          <Stepper :value="currentStep" class="w-full" @update:value="handleStepperChange">
            <div class="flex items-start w-full">
              <template v-for="(s, i) in steps" :key="s.step">
                <StepperItem
                  :step="s.step"
                  :disabled="isStepDisabled(s.step)"
                  class="group flex flex-col items-center gap-2 shrink-0"
                >
                  <StepperTrigger class="p-0 rounded-full group-data-[disabled]:cursor-not-allowed">
                    <StepperIndicator
                      :class="[
                        'flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-semibold transition-all duration-300',
                        s.step < currentStep
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : s.step === currentStep
                            ? 'bg-white border-orange-500 text-orange-500'
                            : 'bg-white border-gray-200 text-gray-400 opacity-50',
                      ]"
                    >
                      <Check v-if="s.step < currentStep" class="w-4 h-4" />
                      <span v-else>{{ s.step }}</span>
                    </StepperIndicator>
                  </StepperTrigger>

                  <div class="flex flex-col items-center text-center">
                    <span :class="[
                      'text-sm font-semibold leading-tight transition-colors duration-200',
                      s.step === currentStep ? 'text-gray-900' : s.step < currentStep ? 'text-gray-500' : 'text-gray-400',
                    ]">{{ s.title }}</span>
                    <span :class="[
                      'text-xs leading-tight mt-0.5 transition-colors duration-200',
                      s.step === currentStep ? 'text-gray-500' : s.step < currentStep ? 'text-gray-400' : 'text-gray-300',
                    ]">{{ s.description }}</span>
                  </div>
                </StepperItem>

                <div
                  v-if="i < steps.length - 1"
                  :class="[
                    'flex-1 h-[2px] mt-[18px] rounded-full transition-all duration-500 self-start',
                    s.step < currentStep ? 'bg-orange-400' : 'bg-gray-200',
                  ]"
                />
              </template>
            </div>
          </Stepper>
        </DialogHeader>

        <!-- Scrollable step content -->
        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
            <StepSelectSeries
              v-if="currentStep === 1"
              :selected-series="selectedSeries"
              @update:selected-series="selectedSeries = $event"
              @variant-resolved="handleVariantResolved"
            />
            <StepSelectModel
              v-else-if="currentStep === 2"
              :series="selectedSeries"
              :selected-model="selectedModel"
              @update:selected-model="selectedModel = $event"
            />
            <StepSelectVariant
              v-else-if="currentStep === 3"
              :model-id="selectedModel!.id"
              :selected-variant-id="selectedVariantId"
              @select="handleVariantSelect"
            />
          </div>
        </ScrollArea>

        <!-- Footer -->
        <div class="shrink-0 border-t border-gray-200 flex gap-3 p-4 bg-white">
          <Button
            variant="outline"
            class="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            @click="currentStep === 1 ? handleOpenChange(false) : prevStep()"
          >
            {{ currentStep === 1 ? 'Annuleren' : 'Terug' }}
          </Button>
          <Button
            class="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white"
            :disabled="!canGoNext || isLastStep"
            @click="nextStep"
          >
            Volgende
          </Button>
        </div>
      </template>

    </DialogContent>
  </Dialog>
</template>
