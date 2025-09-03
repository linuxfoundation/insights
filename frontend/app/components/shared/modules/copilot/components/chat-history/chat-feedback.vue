<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex gap-2 -mt-2">
    <lfx-tooltip content="Good response">
      <lfx-feedback-button
        type="good"
        :is-selected="feedback === 1"
        @click="saveFeedback(1)"
      />
    </lfx-tooltip>
    <lfx-tooltip content="Bad response">
      <lfx-feedback-button
        type="bad"
        :is-selected="feedback === 0"
        @click="saveFeedback(0)"
      />
    </lfx-tooltip>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { copilotApiService } from '../../store/copilot.api.service';
import LfxFeedbackButton from './feedback-button.vue'
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue'
import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const props = defineProps<{
  id: string;
}>()

const { token } = storeToRefs(useAuthStore());

const feedback = ref<number | null>(null);

const saveFeedback = async (value: number) => {
  feedback.value = feedback.value === value ? null : value;

  await copilotApiService.saveFeedback(props.id, feedback.value, token.value);
}

</script>

<script lang="ts">
export default {
  name: 'LfxChatFeedback'
}
</script>