<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-between items-start pb-4 sm:pb-5 flex-wrap gap-2">
    <div class="w-full md:w-3/4">
      <!-- Title -->
      <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
        <h1 class="text-heading-3 font-secondary font-bold">Controls assessment</h1>
        <lfx-tooltip
          v-if="isAuthenticated && isRepository && currentRepoUrl"
          placement="top"
        >
          <template #content>
            <p class="font-bold text-xs">Repository updates can’t be processed immediately</p>
            <p class="text-xs text-neutral-300">Assessment results will be updated within an hour.</p>
          </template>
          <lfx-button
            type="tertiary"
            size="small"
            button-style="pill"
            class="whitespace-nowrap"
            :disabled="isUpdatingResults"
            @click="handleUpdateResultsClick"
          >
            <lfx-spinner
              v-if="isUpdatingResults"
              :size="14"
              class="mr-1"
            />
            <lfx-icon
              v-else
              name="arrows-rotate-reverse"
              :size="12"
            />
            Update results
          </lfx-button>
        </lfx-tooltip>
      </div>

      <!-- Description -->
      <p class="text-xs text-neutral-500 pr-6 sm:pr-8">
        Process of assessing a project's practices, policies, and technical measures against a set of predefined
        standards to determine its security posture, reliability, and maturity.
        <a
          :href="links.securityScore"
          class="text-brand-500"
          target="_blank"
          rel="noopener noreferrer"
          >Learn more</a
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'nuxt/app';
import { links } from '~/config/links';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { SECURITY_API_SERVICE } from '~/components/modules/project/services/security.api.service';

const { selectedReposValues } = storeToRefs(useProjectStore());
const { isAuthenticated } = storeToRefs(useAuthStore());
const { showToast } = useToastService();
const route = useRoute();
const { name } = route.params;

const isUpdatingResults = ref(false);
const isRepository = computed(() => !!name);

// Get the current repository URL for security update
const currentRepoUrl = computed(() => {
  if (!isRepository.value || !selectedReposValues.value?.length) return '';
  return selectedReposValues.value[0];
});

const handleUpdateResultsClick = async () => {
  if (!currentRepoUrl.value || isUpdatingResults.value) return;

  isUpdatingResults.value = true;

  try {
    await SECURITY_API_SERVICE.triggerSecurityUpdate({
      slug: route.params.slug as string,
      repoUrl: currentRepoUrl.value || '',
    });
    showToast(
      '<span class="text-neutral-300">Repository updates can’t be processed immediately.<br>Assessment results will be updated within an hour.</span>',
      ToastTypesEnum.positive,
      '',
      5000,
      {
        title: 'Controls assessment results updated',
      },
    );
  } catch (error) {
    console.error('Failed to trigger security update:', error);
    showToast('An error occurred while triggering the update', ToastTypesEnum.negative, 'circle-exclamation', 5000, {
      summary: 'Failed to update results',
    });
  } finally {
    isUpdatingResults.value = false;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityControlAssesmentHead',
};
</script>
