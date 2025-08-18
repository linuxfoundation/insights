<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded-lg shadow-lg mt-4">
    <!-- Header with widget info -->
    <div class="p-2 flex">
      <div class="flex items-center gap-1 bg-neutral-600 px-3 py-1 rounded-full">
        <lfx-icon
          :name="widgetConfig.copilot?.icon || 'users'"
          :size="12"
          class="text-white"
        />
        <span class="text-xs font-semibold text-white">{{ widgetTitle }}</span>
      </div>
    </div>

    <!-- Main content -->
    <div class="px-2 pb-2 xl:w-[30rem] w-96">
      <!-- Input field -->
      <div class="mb-2">
        <textarea
          v-model="userQuestion"
          :placeholder="`e.g. ${widgetConfig.copilot?.suggestions}`"
          class="w-full p-3 bg-neutral-100 rounded-sm text-xs resize-none focus:outline-none"
          rows="2"
          style="word-break: break-word; white-space: pre-wrap;"
          @keydown.enter="handleAskCopilot"
        />
      </div>

      <!-- Suggestions section -->
      <div class="flex justify-between">
        <div class="flex items-center gap-1">
          <lfx-icon
            name="lightbulb"
            :size="12"
            class="text-neutral-500"
          />
          <span class="text-xs font-medium text-neutral-500">Suggestions</span>
        </div>

        <!-- Ask Copilot button -->
        <div class="flex justify-end">
          <lfx-button
            :disabled="!userQuestion.trim()"
            type="primary"
            size="medium"
            icon="fa fa-sparkles"
            label="Ask Copilot"
            @click="handleAskCopilot"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {storeToRefs} from "pinia";
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import {lfxWidgets} from "~/components/modules/widget/config/widget.config"
import type {Widget} from "~/components/modules/widget/types/widget"
import {useCopilotStore} from "~/components/shared/modules/copilot/store/copilot.store";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { barGranularities } from '~/components/shared/types/granularity';

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const emit = defineEmits<{
  (e: 'action-done'): void
}>()

const userQuestion = ref('')

const widgetConfig = computed(() => lfxWidgets[props.widgetName as Widget])
const widgetTitle = computed(() => widgetConfig.value?.name || 'Widget')

const {openCopilotModal} = useCopilotStore()

const {
  project, 
  startDate, 
  endDate,
  selectedTimeRangeKey, 
  customRangeGranularity} = storeToRefs(useProjectStore());

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));

const handleAskCopilot = () => {
  if (userQuestion.value.trim()) {
    openCopilotModal({
      icon: 'users',
      suggestions: '',
      widget: props.widgetName as Widget,
      project: project.value || undefined,
      question: userQuestion.value.trim(),
      params: {
        startDate: startDate.value || '',
        endDate: endDate.value || '',
        granularity: granularity.value,
        project: project.value?.slug || ''
      }
    });

    // Reset input
    userQuestion.value = ''

    // Close modal after asking
    emit('action-done')
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotWidgetModal'
}
</script>
