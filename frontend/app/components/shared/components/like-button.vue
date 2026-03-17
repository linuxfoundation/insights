<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tooltip :content="isLiked ? 'Dislike collection' : 'Like collection'">
    <lfx-button
      :type="buttonType"
      :size="size"
      class="w-full flex justify-center items-center"
      :class="[
        isLiked || buttonType !== 'transparent' ? 'opacity-100' : 'opacity-50 hover:!opacity-100',
        buttonType === 'transparent' ? 'hover:!bg-transparent' : '',
        $attrs.class,
      ]"
      @click.stop.prevent="handleLike"
    >
      <lfx-icon
        v-if="variant === 'my-collections'"
        :name="isLiked ? 'heart-slash' : 'heart'"
        :size="16"
        :class="'text-neutral-900'"
        :type="'light'"
      />
      <lfx-icon
        v-else
        name="heart"
        :size="16"
        :class="isLiked ? '!text-negative-500' : 'text-neutral-900'"
        :type="isLiked ? 'solid' : 'light'"
      />
      <span
        v-if="likeCount !== undefined || isLiked"
        class="text-xs leading-4 text-neutral-900 font-medium"
      >
        {{ formatNumberShort(isLiked && likeCount === 0 ? 1 : likeCount) }}
      </span>
    </lfx-button>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import type { Collection, CollectionType } from '~~/types/collection';
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import type { ButtonType } from '~/components/uikit/button/types/button.types';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import type { ButtonSize } from '~/components/uikit/button/types/button.types';
import { TanstackKey } from '~/components/shared/types/tanstack';

const collectionsStore = useCollectionsStore();
const queryClient = useQueryClient();

const { showToast } = useToastService();

const props = withDefaults(
  defineProps<{
    collection: Collection;
    buttonType?: ButtonType;
    variant?: CollectionType;
    size?: ButtonSize;
  }>(),
  {
    buttonType: 'transparent',
    variant: 'community',
    size: 'medium',
  },
);

const emit = defineEmits<{
  (e: 'updated', collection: Collection): void;
}>();

const isLiked = computed(() => collectionsStore.isLiked(props.collection.id));
const likeCount = ref<number>(props.collection.likeCount || 0);

const invalidateCollectionQueries = () => {
  queryClient.invalidateQueries({ queryKey: [TanstackKey.COLLECTIONS] });
  queryClient.invalidateQueries({ queryKey: [TanstackKey.COLLECTION] });
  queryClient.invalidateQueries({ queryKey: [TanstackKey.COLLECTION_DISCOVERY] });
  queryClient.invalidateQueries({ queryKey: [TanstackKey.LIKED_COLLECTIONS] });
  queryClient.invalidateQueries({ queryKey: [TanstackKey.MY_COLLECTIONS] });
};

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
      } else {
        invalidateCollectionQueries();
        emit('updated', props.collection);
      }
    } else {
      collectionsStore.addLikedCollection(props.collection.id);
      likeCount.value = likeCount.value + 1;
      const { success } = await COLLECTIONS_API_SERVICE.likeCollection(props.collection.id);
      if (!success) {
        collectionsStore.removeLikedCollection(props.collection.id);
        likeCount.value = Math.max(0, likeCount.value - 1);
        showToast('Failed to like collection', ToastTypesEnum.negative);
      } else {
        invalidateCollectionQueries();
        emit('updated', props.collection);
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
