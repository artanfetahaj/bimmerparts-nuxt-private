<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Check } from 'lucide-vue-next'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:currentStep"]);

// Track previous step to help with animations
const previousStep = ref(props.currentStep);
const recentlyChangedStep = ref(-1);

watch(() => props.currentStep, (newStep, oldStep) => {
  previousStep.value = oldStep;
  recentlyChangedStep.value = newStep;
  
  // Reset the recently changed indicator after animation completes
  // Using a shorter timeout to make transitions feel more responsive
  setTimeout(() => {
    recentlyChangedStep.value = -1;
  }, 300);
});

const handleStepClick = (index) => {
  if (props.clickable) {
    emit("update:currentStep", index);
  }
};

const getStepState = (index) => {
  if (index < props.currentStep) return "completed";
  if (index === props.currentStep) return "active";
  return "inactive";
};

const getStepAnimationClass = (index) => {
  if (index === recentlyChangedStep.value) return "step-highlight";
  if (index === props.currentStep) return "step-active";
  if (index === previousStep.value) return "step-previous";
  return "";
};
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="flex flex-1 items-center"
    >
      <!-- Step indicator and label in a row -->
      <div class="flex items-center">
        <!-- Circle indicator with refined styling and animations -->
        <div
          :class="[
            'flex items-center justify-center rounded-full w-6 h-6 shrink-0 font-medium text-xs transition-all duration-300',
            getStepState(index) === 'completed' ? 'bg-slate-200 text-slate-800 shadow-sm' : '',
            getStepState(index) === 'active' ? 'bg-white border-2 border-primary text-primary shadow-sm' : '',
            getStepState(index) === 'inactive' ? 'bg-white border border-slate-200 text-slate-400' : '',
            props.clickable ? 'cursor-pointer hover:scale-105' : '',
            getStepAnimationClass(index)
          ]"
          @click="handleStepClick(index)"
        >
          <Check v-if="getStepState(index) === 'completed'" class="w-3.5 h-3.5" />
          <span v-else>{{ index + 1 }}</span>
        </div>

        <!-- Step label with refined typography -->
        <span
          :class="[
            'ml-2 text-xs font-medium whitespace-nowrap transition-colors duration-300',
            getStepState(index) === 'active' ? 'text-primary font-semibold' : '',
            getStepState(index) === 'completed' ? 'text-slate-500' : '',
            getStepState(index) === 'inactive' ? 'text-slate-400' : '',
          ]"
        >
          {{ step.label }}
        </span>
      </div>

      <!-- Connector line with refined styling and animations -->
      <div v-if="index < steps.length - 1" class="flex-1 mx-2">
        <div
          :class="[
            'h-[2px] transition-all duration-500 rounded-full',
            index === props.currentStep - 1 ? 'connector-gradient connector-animated' : '',
            index < props.currentStep ? 'bg-slate-200' : 'bg-slate-200',
            index === props.currentStep - 2 && previousStep.value === props.currentStep - 1 ? 'connector-complete' : '',
            index === props.currentStep && previousStep.value === props.currentStep + 1 ? 'connector-revert' : ''
          ]"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gradient connector */
.connector-gradient {
  background: linear-gradient(90deg, hsl(220, 10%, 80%), hsl(var(--primary)));
  position: relative;
  overflow: hidden;
}

.connector-gradient::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* Step transition animations */
.flex-1 {
  transition: width 0.3s ease-out;
}

/* Circle indicator animations - smoother transitions */
div[class*="rounded-full"] {
  transition: transform 0.25s ease-out, border-color 0.15s linear, background-color 0.15s linear, color 0.15s linear, box-shadow 0.25s ease-out;
  will-change: transform, border-color, background-color, color, box-shadow;
}

/* For completed steps - smoother transition without delay */
div[class*="bg-secondary"] {
  transition: transform 0.25s ease-out, background-color 0.15s linear, color 0.15s linear, box-shadow 0.25s ease-out;
}

/* Remove the separate animation for completed steps to avoid stutter */
/* Instead, use the transition property defined above */

/* For active step - more subtle and immediate response */
div[class*="border-primary"] {
  transition: transform 0.25s ease-out, border-color 0.15s linear, background-color 0.15s linear, color 0.15s linear, box-shadow 0.25s ease-out;
}

/* Instead of separate animations, step-active and step-highlight will be used */

/* Connector line animation - smoother transition */
div[class*="h-[2px]"] {
  transition: background-color 0.2s linear, opacity 0.2s linear, transform 0.2s ease-out;
  will-change: background-color, opacity, transform;
}

/* Step animation classes */
.step-highlight {
  animation: stepHighlight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.step-active {
  animation: stepActive 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.step-previous {
  animation: stepPrevious 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes stepHighlight {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes stepActive {
  0% {
    transform: scale(0.98);
  }
  40% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes stepPrevious {
  0% {
    opacity: 0.95;
  }
  60% {
    opacity: 0.85;
  }
  100% {
    opacity: 1;
  }
}

/* Connector animations */
.connector-animated {
  position: relative;
  overflow: hidden;
}

.connector-animated::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  animation: connectorPulse 0.8s ease-out;
}

.connector-complete {
  animation: completeConnector 0.5s ease-out;
}

.connector-revert {
  animation: revertConnector 0.5s ease-out;
}

@keyframes connectorPulse {
  0% {
    transform: translateX(-100%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes completeConnector {
  0% {
    opacity: 0.9;
    transform: scaleX(0.99);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes revertConnector {
  0% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}
</style>
