// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {defineStore} from 'pinia';
import {ref} from 'vue';
import type { CopilotData } from '../types/copilot.types';
import { Widget } from '~/components/modules/widget/types/widget';

const defaultData: CopilotData = {
    widget: Widget.ACTIVE_CONTRIBUTORS,
    icon: 'sparkles',
    suggestions: '',
}

export const useCopilotStore = defineStore('copilot', () => {
    const isCopilotModalOpen = ref(false);
    const copilotDefaults = ref<CopilotData>(defaultData);


    const openCopilotModal = (defaults: CopilotData = defaultData) => {
        copilotDefaults.value = defaults;
        isCopilotModalOpen.value = true;
    };

    return {
        isCopilotModalOpen,
        copilotDefaults,
        openCopilotModal,
    };
});
