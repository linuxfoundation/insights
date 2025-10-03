<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold leading-5 text-brand-600">
        Project details
      </p>
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Documentation
      </h2>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Soluta perferendis laudantium temporibus neque consectetur ipsam delectus sit debitis corrupti soluta
        debitis quos.
      </p>
    </div>

    <!-- Form Fields -->
    <lfx-field label="Quickstart guide URL">
      <lfx-input
        v-model="formData.quickstartGuideUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>

    <lfx-field label="Detailed guide URL">
      <lfx-input
        v-model="formData.detailedGuideUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>

    <lfx-field label="Code of conduct URL">
      <lfx-input
        v-model="formData.codeOfConductUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>

    <lfx-field label="Release process URL">
      <lfx-input
        v-model="formData.releaseProcessUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>

    <lfx-field label="Support policy URL">
      <lfx-input
        v-model="formData.supportPolicyUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>

    <lfx-field label="Signature verification URL">
      <lfx-input
        v-model="formData.signatureVerificationUrl"
        placeholder=""
      />
      <lfx-field-message
        type="info"
        :hide-icon="true"
      >
        Lorem ipsum
      </lfx-field-message>
    </lfx-field>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxFieldMessage from '~/components/uikit/field/field-message.vue';

const formData = ref({
  quickstartGuideUrl: '',
  detailedGuideUrl: '',
  codeOfConductUrl: '',
  releaseProcessUrl: '',
  supportPolicyUrl: '',
  signatureVerificationUrl: '',
});
</script>
