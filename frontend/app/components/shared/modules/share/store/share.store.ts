// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {ShareData} from "~/components/shared/modules/share/types/share.types";
import useResponsive from "~/components/shared/utils/responsive";

const defaultData = {
    url: ''
}

export const useShareStore = defineStore('share', () => {
    const isShareModalOpen = ref(false);
    const shareDefaults = ref<ShareData>(defaultData);

    const {isMobileOrTablet} = useResponsive();

    const canUseNativeShare = () => typeof navigator.share === 'function' && isMobileOrTablet()

    const openShareModal = (defaults: ShareData = defaultData) => {
        shareDefaults.value = defaults;
        if(canUseNativeShare()) {
            navigator.share({
                title: defaults.title,
                url: defaults.url
            }).catch(() => {
                isShareModalOpen.value = true;
            });
            return;
        }
        isShareModalOpen.value = true;
    };

    return {
        isShareModalOpen,
        shareDefaults,
        openShareModal,
    };
});
