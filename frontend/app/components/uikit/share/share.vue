<template>
  <lfx-tooltip
    placement="top"
    content="Copy link"
    :disabled="isSharable || !isCopyable"
  >
    <div
      v-if="isSharable || isCopyable"
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

const isSharable = computed(() => !!navigator?.share);
const isCopyable = computed(() => !!navigator?.clipboard);

const share = () => {
  if (navigator?.share) {
    navigator?.share({
      title: document.title,
      url: sharableLink.value
    });
  }
  if(navigator?.clipboard){
    navigator?.clipboard.writeText(sharableLink.value);
    if(!isSharable.value){
      showToast(
          `Link copied to clipboard`,
          ToastTypesEnum.positive,
      );
    }
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxShare'
};
</script>
