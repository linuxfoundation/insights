// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CopilotData, ResultsHistory } from '../types/copilot.types'
import { Widget } from '~/components/modules/widget/types/widget'

const defaultData: CopilotData = {
  widget: Widget.ACTIVE_CONTRIBUTORS,
  icon: 'sparkles',
  suggestions: '',
}

export const useCopilotStore = defineStore('copilot', () => {
  const isCopilotModalOpen = ref(false)
  const copilotDefaults = ref<CopilotData>(defaultData)
  const resultData = ref<ResultsHistory[]>([])
  const selectedResultId = ref<string | null>(null)
  const selectedWidgetKey = ref<Widget | undefined>(undefined)

  const openCopilotModal = (defaults: CopilotData = defaultData) => {
    copilotDefaults.value = defaults
    selectedWidgetKey.value = defaults.widget
    isCopilotModalOpen.value = true
  }

  const resetResultData = () => {
    resultData.value = []
    selectedResultId.value = null
  }

  return {
    isCopilotModalOpen,
    copilotDefaults,
    openCopilotModal,
    resultData,
    selectedResultId,
    resetResultData,
    selectedWidgetKey,
  }
})
