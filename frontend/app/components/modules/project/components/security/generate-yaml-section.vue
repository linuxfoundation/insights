<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex md:flex-col flex-row justify-center items-start gap-3 mb-5">
    <div class="flex items-center justify-center w-8 h-8 bg-accent-100 rounded-full">
      <img
        src="~/assets/images/yaml-icon.png"
        alt="YAML icon"
      />
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-sm font-semibold text-neutral-900">YAML security file</span>
      <p class="text-xs text-neutral-600">
        Generate a security metadata file to enable automated security assessments and provide clear contact information
        of your GitHub repository.
      </p>
    </div>
  </div>

  <lfx-button
    type="tertiary"
    size="small"
    button-style="pill"
    class="flex justify-center w-full !font-semibold"
    @click="handleGenerateYamlClick"
  >
    Generate YAML
  </lfx-button>

  <lf-security-generate-yaml-modal
    v-if="isGenerateYamlModalOpen"
    v-model="isGenerateYamlModalOpen"
    @update:model-value="handleGenerateYamlUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQueryParam } from '~/components/shared/utils/query-param';
import {
  securityParamsGetter,
  securityParamsSetter,
} from '~/components/modules/project/services/project.query.service';
import LfxButton from '~/components/uikit/button/button.vue';
import LfSecurityGenerateYamlModal from '~/components/modules/project/components/security/yaml/generate-yaml-modal.vue';

const { queryParams } = useQueryParam(securityParamsGetter, securityParamsSetter);
const { generateYaml } = queryParams.value;
const isGenerateYamlModalOpen = ref(generateYaml === 'true' || false);

const handleGenerateYamlClick = () => {
  isGenerateYamlModalOpen.value = true;
  queryParams.value = {
    generateYaml: 'true',
  };
};

const handleGenerateYamlUpdate = (value: boolean) => {
  queryParams.value = {
    generateYaml: value ? 'true' : undefined,
  };
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityGenerateYamlSection',
};
</script>
