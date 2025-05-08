<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tooltip
    placement="top"
    content="Copy link"
    :disabled="(isSharable && isMobile) || !isCopyable"
  >
    <div
      v-if="(isSharable && isMobile) || isCopyable"
      class="w-min"
      @click="share()"
    >
      <slot />
    </div>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import {computed} from "vue";
import useToastService from "~/components/uikit/toast/toast.service";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";
import useResponsive from "~/components/shared/utils/responsive";

const props = defineProps<{
    url?: string;
  }>();

const { showToast } = useToastService();

const sharableLink = computed(() => {
  if(!props.url){
    return window?.location.href;
  }
  return props.url;
});

const {pageWidth} = useResponsive();

const isSharable = ref<boolean>(false);
const isCopyable = ref<boolean>(false);

const isMobile = computed(() => pageWidth.value < 768);

const share = () => {
  if (navigator?.share && isMobile.value) {
    navigator?.share({
      title: document.title,
      url: sharableLink.value
    });
  }
  if(navigator?.clipboard){
    navigator?.clipboard.writeText(sharableLink.value);
    if(!(isSharable.value && isMobile.value)){
      showToast(
          `Link copied to clipboard`,
          ToastTypesEnum.positive,
      );
    }
  }
};

onMounted(() => {
  isSharable.value = !!navigator?.share;
  isCopyable.value = !!navigator?.clipboard;
});
</script>

<script lang="ts">
export default {
  name: 'LfxShare'
};
</script>
