<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="30rem"
  >
    <div class="p-6">
      <div class="flex justify-between items-center pb-8">
        <h3 class="text-heading-3 font-secondary font-bold">Health score badge</h3>
        <lfx-icon-button
          icon="close"
          size="small"
          type="default"
          @click="isModalOpen = false"
        />
      </div>
      <div class="rounded-lg bg-neutral-50 border border-neutral-200 py-3.5 px-4 flex justify-center">
        <img
          :src="badgeUrl"
          alt="LFX Health Score badge"
          class="h-5"
        >
      </div>
      <p class="text-body-2 text-neutral-500 py-4">
        Copy and paste your Health Score badge directly into your project's GitHub README file,
        giving contributors and users instant insight into the state of your project.
      </p>
      <lfx-button
        type="tertiary"
        button-style="pill"
        class="w-full justify-center"
        @click="copyBadge()"
      >
        <lfx-icon name="clone" />
        Copy markdown
      </lfx-button>
    </div>

  </lfx-modal>
</template>

<script setup lang="ts">
import {computed} from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {lfxTrustScore, type TrustScoreConfig, getBadgeUrl} from "~/components/modules/project/config/trust-score";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";

const props = defineProps<{
  modelValue: boolean;
  overallScore: number
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void;
}>();

const {showToast} = useToastService();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const scoreConfig = computed<TrustScoreConfig>(() => lfxTrustScore.find(
      (s) => props.overallScore <= s.maxScore && props.overallScore >= s.minScore
  ) || lfxTrustScore.at(-1)!);

const badgeUrl = computed(() => getBadgeUrl(scoreConfig.value));

const markdown = computed(() => {
  const link = window?.location.href;
  return `[![LFX Health Score](${badgeUrl.value})](${link})`;
});

const copyBadge = () => {
  navigator?.clipboard.writeText(markdown.value);
    showToast(
        `Health score badge copied to clipboard`,
        ToastTypesEnum.positive,
    );
    isModalOpen.value = false;
}
</script>

<script lang="ts">
export default {
  name: 'LfxTrustScoreGithubBadge',
}
</script>
