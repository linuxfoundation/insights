<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center justify-between">
    <lfx-skeleton-state
      :status="activeContributorsError ? 'error' : activeContributorsStatus"
      height="1.25rem"
      width="12rem"
    >
      <img
        :src="activeBadgeUrl"
        alt="LFX Active Contributors badge"
        class="h-5"
      >
    </lfx-skeleton-state>

    <lfx-button
      type="tertiary"
      size="small"
      button-style="pill"
      :disabled="activeContributorsStatus === 'pending'"
      @click="copyBadge(markdown(activeBadgeUrl))"
    >
      <lfx-icon
        name="clone"
        :size="14"
      />
      Copy markdown
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { DateTime } from 'luxon';
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { getBadgeUrl } from "~/components/modules/project/config/trust-score";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";
import { SHARE_API_SERVICE } from '~~/app/components/shared/modules/share/store/share.api.service';
import { lfxColors } from '~/config/styles/colors';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";

const emit = defineEmits<{(e: 'copied'): void;}>();

const {showToast} = useToastService();

const route = useRoute();
const { selectedRepository } = storeToRefs(useProjectStore())

const activeContributorsParams = computed(() => ({
  projectSlug: route.params.slug as string,
  repository: selectedRepository.value,
  startDate: startDate.value,
  endDate: endDate.value
}));

const startDate = computed(() => DateTime.now().minus({ days: 365 }).startOf('day').toFormat('yyyy-MM-dd'));
const endDate = computed(() => DateTime.now().endOf('day').toFormat('yyyy-MM-dd'));

// Active contributors data fetch
const {
  data: activeContributorsData, status: activeContributorsStatus, error: activeContributorsError
} = SHARE_API_SERVICE.fetchActiveContributors(activeContributorsParams);

const activeBadgeUrl = computed(() => getBadgeUrl(
  'Active contributors (1Y)',
  formatNumberShort(activeContributorsData.value?.summary.current || 0),
  lfxColors.brand[500].replace('#', '')
));

const markdown = (badgeUrl: string) => {
  const link = window?.location.href;
  return `[![LFX Active Contributors](${badgeUrl})](${link})`;
};

const copyBadge = (markdown: string) => {
  navigator?.clipboard.writeText(markdown);
    showToast(
        `Health score badge copied to clipboard`,
        ToastTypesEnum.positive,
    );
    emit('copied');
}

</script>

<script lang="ts">
export default {
  name: 'LfxActiveContributorBadge',
}
</script>
