<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-button
    :type="buttonType"
    class="w-1/3 flex justify-center items-center"
    :class="[
      isLiked || buttonType !== 'transparent' ? 'opacity-100' : 'opacity-50 hover:!opacity-100',
      buttonType === 'transparent' ? 'hover:!bg-transparent' : '',
    ]"
    @click.stop.prevent="handleLike"
  >
    <lfx-icon
      name="heart"
      :size="16"
      :class="isLiked ? '!text-negative-500' : 'text-neutral-900'"
      :type="isLiked ? 'solid' : 'light'"
    />
    <span
      v-if="likeCount !== undefined"
      class="text-xs leading-4 text-neutral-900 font-medium"
    >
      {{ formatNumberShort(likeCount) }}
    </span>
  </lfx-button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import type { Collection } from '~~/types/collection';
import { useCollectionsStore } from '~/components/modules/collection/services/collections.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import type { ButtonType } from '~/components/uikit/button/types/button.types';
import { formatNumberShort } from '~/components/shared/utils/formatter';

const collectionsStore = useCollectionsStore();

const { showToast } = useToastService();

const props = withDefaults(
  defineProps<{
    collection: Collection;
    buttonType?: ButtonType;
  }>(),
  {
    buttonType: 'transparent',
  },
);

const isLiked = computed(() => collectionsStore.isLiked(props.collection.id));
const likeCount = ref<number>(props.collection.likeCount || 0);

const handleLike = async () => {
  const wasLiked = isLiked.value;

  try {
    if (wasLiked) {
      collectionsStore.removeLikedCollection(props.collection.id);
      likeCount.value = Math.max(0, likeCount.value - 1);
      const { success } = await COLLECTIONS_API_SERVICE.unlikeCollection(props.collection.id);
      if (!success) {
        collectionsStore.addLikedCollection(props.collection.id);
        likeCount.value = likeCount.value + 1;
        showToast('Failed to unlike collection', ToastTypesEnum.negative);
      }
    } else {
      collectionsStore.addLikedCollection(props.collection.id);
      likeCount.value = likeCount.value + 1;
      const { success } = await COLLECTIONS_API_SERVICE.likeCollection(props.collection.id);
      if (!success) {
        collectionsStore.removeLikedCollection(props.collection.id);
        likeCount.value = Math.max(0, likeCount.value - 1);
        showToast('Failed to like collection', ToastTypesEnum.negative);
      }
    }
  } catch {
    showToast('Failed to update like status', ToastTypesEnum.negative);
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxLikeButton',
};
</script>
