<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="600px"
    content-class="!overflow-hidden"
  >
    <div class="flex flex-col gap-8 p-6 bg-white rounded-xl shadow-xl">
      <!-- Header section -->
      <div class="flex flex-col gap-6">
        <lf-create-collection-modal-header
          :step="step"
          @close="isModalOpen = false"
        />

        <!-- Step content -->
        <component
          :is="currentStep?.component"
          v-if="currentStep"
          ref="stepRef"
          v-model="form"
        />
      </div>

      <!-- Footer -->
      <lf-create-collection-modal-footer
        :step="step"
        :can-proceed="canProceed"
        @previous="previousStep"
        @next="nextStep"
        @cancel="isModalOpen = false"
        @submit="createCollection"
      />
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import LfCreateCollectionModalHeader from './modal-header.vue';
import LfCreateCollectionModalFooter from './modal-footer.vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import {
  createCollectionSteps,
  createCollectionTemplate,
  type CreateCollectionStep,
  type CreateCollectionForm,
} from '~/components/modules/collection/config/create-collection.config';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
  }>(),
  {
    modelValue: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  created: [form: CreateCollectionForm];
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const step = ref(0);
const form = ref<CreateCollectionForm>({ ...createCollectionTemplate });
const stepRef = ref<{ $v?: { $invalid: boolean; $touch: () => void } } | null>(null);

const steps = computed<CreateCollectionStep[]>(() => createCollectionSteps);

const currentStep = computed<CreateCollectionStep | null>(() => steps.value[step.value] || null);

const canProceed = computed(() => {
  if (step.value === 0) {
    return form.value.name.trim().length > 0 && form.value.description.trim().length > 0;
  }
  if (step.value === 1) {
    return form.value.projects.length > 0;
  }
  return true;
});

const nextStep = () => {
  if (stepRef.value?.$v) {
    stepRef.value.$v.$touch();
    if (stepRef.value.$v.$invalid) {
      return;
    }
  }
  if (step.value < steps.value.length - 1) {
    step.value += 1;
  }
};

const previousStep = () => {
  if (step.value > 0) {
    step.value -= 1;
  }
};

const createCollection = () => {
  emit('created', form.value);
  isModalOpen.value = false;
};

watch(isModalOpen, (value) => {
  if (!value) {
    step.value = 0;
    form.value = { ...createCollectionTemplate };
  }
});

onMounted(() => {
  form.value = { ...createCollectionTemplate };
});
</script>

<script lang="ts">
export default {
  name: 'LfCreateCollectionModal',
};
</script>
