<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center justify-between">
    <img
      :src="badgeUrl"
      alt="LFX Health Score badge"
      class="h-5"
    >

    <lfx-button
      type="tertiary"
      size="small"
      button-style="pill"
      @click="copyBadge(markdown(badgeUrl))"
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
import {storeToRefs} from "pinia";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {
 getBadgeUrl
} from "~~/config/trust-score";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  type: string;
  title?: string;
}>();

const emit = defineEmits<{(e: 'copied'): void;}>();

const {showToast} = useToastService();

const route = useRoute();

const { selectedReposValues } = storeToRefs(useProjectStore());

const badgeUrl = computed(() => getBadgeUrl(props.type, route.params.slug as string, selectedReposValues.value));

const markdown = (badgeUrl: string) => {
  const link = window?.location.href.split('?')[0];

  return `[![${props.title || 'LFX Health Score'}](${badgeUrl})](${link})`;
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
  name: 'LfxShareBadgeItem',
}
</script>
