<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-copilot-modal
    v-if="isCopilotModalOpen"
    v-model="isCopilotModalOpen"
    :widget-name="copilotDefaults.widget"
  />
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useCopilotStore} from "~/components/shared/modules/copilot/store/copilot.store";
import LfxCopilotModal from "~/components/shared/modules/copilot/components/copilot-modal.vue";

const {isCopilotModalOpen, copilotDefaults } = storeToRefs(useCopilotStore())

</script>

<script lang="ts">
export default {
  name: 'LfxCopilotGlobal',
};
</script> 