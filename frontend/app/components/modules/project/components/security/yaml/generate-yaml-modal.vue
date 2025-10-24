<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="1200px"
    height="900px"
    class="!justify-center"
    content-class="!h-full !overflow-hidden"
  >
    <div class="flex h-full">
      <lf-security-generate-yaml-sidebar />

      <!-- Main content area -->
      <div class="w-2/3 flex flex-col">
        <!-- Header -->
        <div class="border-b border-neutral-200 px-6 pt-4 pb-5">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-secondary font-bold text-neutral-900 leading-8">Generate YAML security file</h1>
            <lfx-icon-button
              icon="close"
              @click="isModalOpen = false"
            />
          </div>
          <div
            v-if="type && step >= 0"
            class="flex flex-col gap-2 mt-3"
          >
            <div class="flex items-center gap-3">
              <lfx-tooltip
                placement="top"
                :content="config?.description || ''"
                :disabled="!config?.description"
                class="flex items-center"
              >
                <lfx-tag
                  size="small"
                  class="bg-neutral-200 text-neutral-600"
                >
                  {{ config?.label }}
                </lfx-tag>
              </lfx-tooltip>
              <p class="text-xs text-neutral-600 !leading-6">
                <span v-if="type && step >= 0">Step {{ step + 1 }}/{{ steps.length + 1 }} - </span>
                <span v-if="!type || step < 0">Choose YAML file template</span>
                <span v-else-if="step < steps.length">{{ currentStep?.label }}</span>
                <span v-else>Preview & Download</span>
              </p>
            </div>
            <div class="relative">
              <div class="bg-brand-50 h-1.5 rounded-full w-full" />
              <div
                class="h-1.5 rounded-full absolute top-0 left-0 transition-all"
                :style="{ width: `${(type ? (step + 1) / (steps.length + 1) : 0) * 100}%` }"
                :class="step < steps.length ? 'bg-brand-500' : 'bg-positive-500'"
              />
            </div>
          </div>
        </div>

        <!-- Form content -->
        <div class="flex-1 p-6 overflow-auto">
          <lfx-security-generate-yaml-type
            v-if="!type || step < 0"
            v-model="type"
          />
          <template v-else>
            <lf-security-generate-yaml-preview
              v-if="step >= steps.length"
              :data="form"
            />
            <component
              :is="steps[step]?.component"
              v-else-if="!!steps[step]"
              v-model="form"
            />
          </template>
        </div>

        <!-- Footer -->
        <div class="border-t border-neutral-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <lfx-button
              v-if="step >= 0 && type"
              type="tertiary"
              button-style="pill"
              @click="step -= 1"
            >
              <lfx-icon name="angle-left" />
              Previous
            </lfx-button>
            <div class="flex-grow" />
            <div class="flex items-center gap-3">
              <template v-if="step < steps.length">
                <lfx-button
                  button-style="pill"
                  type="primary"
                  :disabled="!type || $v.$invalid"
                  @click="step += 1"
                >
                  Next
                  <lfx-icon name="angle-right" />
                </lfx-button>
              </template>
              <template v-else-if="type">
                <lfx-button
                  type="tertiary"
                  button-style="pill"
                  @click="copyToClipboard"
                >
                  <lfx-icon name="clone" />
                  Copy to clipboard
                </lfx-button>
                <lfx-button
                  button-style="pill"
                  @click="downloadYamlFile"
                >
                  <lfx-icon name="arrow-down-to-bracket" />
                  Download YAML file
                </lfx-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfSecurityGenerateYamlSidebar from '~/components/modules/project/components/security/yaml/generate-yaml-sidebar.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfSecurityGenerateYamlPreview from '~/components/modules/project/components/security/yaml/generate-yaml-preview.vue';
import LfxSecurityGenerateYamlType from '~/components/modules/project/components/security/yaml/generate-yaml-type.vue';
import {
  type YamlGenerationConfig,
  yamlGenerationConfig,
  type YamlGenerationStep,
} from '~/components/modules/project/config/yaml-generation/yaml-generation.config';
import { getYaml } from '~/components/modules/project/services/js-yaml';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';

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
}>();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const { showToast } = useToastService();

const type = ref('');
const step = ref(-1);
const form = ref({});

const copyToClipboard = async () => {
  if (navigator.clipboard) {
    const yamlContent = getYaml(form.value);
    await navigator.clipboard.writeText(yamlContent);
    showToast('YAML file content copied to clipboard', ToastTypesEnum.positive, 'circle-check');
  }
};

const downloadYamlFile = () => {
  let url: string | null = null;
  try {
    const yamlContent = getYaml(form.value);

    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
    url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'security.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('YAML file successfully downloaded', ToastTypesEnum.positive, 'circle-check');
  } catch (error) {
    console.error('Failed to download YAML file:', error);
    if (url) {
      URL.revokeObjectURL(url);
    }
    showToast('Failed to download YAML file', ToastTypesEnum.negative);
  }
};

const $v = useVuelidate({}, form);

const config = computed<YamlGenerationConfig | null>(() => {
  return yamlGenerationConfig[type.value] || null;
});

const steps = computed<YamlGenerationStep[]>(() => {
  if (!config.value) return [];
  return config.value.steps || [];
});

const currentStep = computed<YamlGenerationStep | null>(() => {
  return steps.value[step.value] || null;
});

watch(type, (newType: string) => {
  form.value = { ...(yamlGenerationConfig[newType]?.template || {}) };
});

onMounted(() => {
  form.value = {};
});
</script>

<script lang="ts">
export default {
  name: 'LfSecurityGenerateYamlModal',
};
</script>
