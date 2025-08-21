<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded-lg shadow-lg mt-4">
    <!-- Main content -->
    <div class="p-2 xl:w-[30rem] w-96">
      <!-- Input field -->
      <div class="mb-2 h-[75px]">
        <textarea
          ref="textareaRef"
          v-model="userQuestion"
          autofocus
          :placeholder="`e.g. ${widgetConfig.copilot?.suggestions}`"
          class="w-full p-3 bg-neutral-100 rounded-lg text-sm resize-none focus:outline-none h-[75px]"
          rows="2"
          style="word-break: break-word; white-space: pre-wrap;"
          @keydown.enter="handleAskCopilot"
        />
      </div>

      <!-- Suggestions section -->
      <div class="flex justify-end">
        <!-- <div class="flex items-center gap-1">
          <lfx-icon
            name="lightbulb"
            :size="12"
            class="text-neutral-500"
          />
          <span class="text-xs font-medium text-neutral-500">Suggestions</span>
        </div> -->

        <!-- Ask Copilot button -->
        <div class="flex justify-end">
          <div
            class="w-[28px] h-[28px] flex items-center justify-center
              rounded-full transition-all text-base text-white"
            :class="{
              'bg-brand-500 opacity-50 cursor-not-allowed': !userQuestion.trim(),
              'bg-brand-500 hover:bg-brand-600 cursor-pointer': userQuestion.trim()
            }"
            @click="userQuestion.trim() && handleAskCopilot()"
          >
            <i class="fa fa-light fa-arrow-up" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import {storeToRefs} from "pinia";
// import LfxIcon from '~/components/uikit/icon/icon.vue'
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
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'action-done'): void
}>()

const textareaRef = ref(null)
const userQuestion = ref('')

const widgetConfig = computed(() => lfxWidgets[props.widgetName as Widget])
// const widgetTitle = computed(() => widgetConfig.value?.name || 'Widget')

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

watch(() => props.isOpen, async (newVal: boolean) => {
  if (newVal) {
    await nextTick()
    textareaRef.value?.focus()
  }
}, { immediate: true })
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotWidgetModal'
}
</script>
