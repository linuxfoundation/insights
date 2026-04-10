<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <template v-if="showAsDropdown">
    <lfx-dropdown-item @click="handleLike">
      <lfx-icon
        :name="isLiked ? 'heart-slash' : 'heart'"
        :size="16"
        :class="'text-neutral-900'"
        :type="'light'"
      />
      {{ isLiked ? 'Dislike collection' : 'Like collection' }}
    </lfx-dropdown-item>
  </template>
  <lfx-tooltip
    v-else
    :content="isLiked ? 'Dislike collection' : 'Like collection'"
  >
    <lfx-button
      :type="buttonType"
      button-style="pill"
      class="w-full flex justify-center items-center"
      :class="[isLiked || buttonType !== 'ghost' ? 'opacity-100' : 'opacity-50 hover:!opacity-100', $attrs.class]"
      @click.stop.prevent="handleLike"
    >
      <div class="p-0.5">
        <lfx-icon
          v-if="variant === 'my-collections' || (showUnlikeIcon && isLiked)"
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
      </div>
      <lfx-spinner
        v-if="likeCountLoading"
        :size="12"
      />
      <span
        v-else-if="likeCount !== undefined || isLiked"
        class="text-xs leading-4 text-neutral-900 font-medium"
      >
        {{ formatNumberShort(isLiked && (!likeCount || likeCount === 0) ? 1 : (likeCount ?? 0)) }}
      </span>
    </lfx-button>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import type { Collection, CollectionType } from '~~/types/collection';
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import type { ButtonType } from '~/components/uikit/button/types/button.types';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import { CollectionTypeEnum } from '~/components/modules/collection/config/collection-type-config';
import { useTrackEvent } from '~~/composables/useTrackEvent';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';
// import { useAuth } from '~~/composables/useAuth';

const collectionsStore = useCollectionsStore();
const queryClient = useQueryClient();
const { showToast } = useToastService();
const { trackEvent } = useTrackEvent();

const props = withDefaults(
  defineProps<{
    collection: Collection;
    buttonType?: ButtonType;
    variant?: CollectionType;
    showUnlikeIcon?: boolean;
    showAsDropdown?: boolean;
  }>(),
  {
    buttonType: 'ghost',
    variant: CollectionTypeEnum.COMMUNITY,
    size: 'medium',
    showUnlikeIcon: false,
    showAsDropdown: false,
  },
);

const emit = defineEmits<{
  (e: 'updated', collection: Collection): void;
}>();

const isLiked = computed(() => collectionsStore.isLiked(props.collection.id));
const likeCount = computed(() => collectionsStore.getLikeCount(props.collection.id) ?? props.collection.likeCount);
const likeCountLoading = computed(() => likeCount.value === undefined);

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
      collectionsStore.adjustLikeCount(props.collection.id, -1, props.collection.likeCount);
      const { success } = await COLLECTIONS_API_SERVICE.unlikeCollection(props.collection.id);

      if (!success) {
        collectionsStore.addLikedCollection(props.collection.id);
        collectionsStore.adjustLikeCount(props.collection.id, 1, props.collection.likeCount);
        showToast('Failed to unlike collection', ToastTypesEnum.negative);
      } else {
        trackEvent({
          key: CollectionsEventKey.DISLIKE_COLLECTION,
          properties: {
            collectionId: props.collection.id,
          },
        });
        invalidateCollectionQueries();
        emit('updated', props.collection);
      }
    } else {
      const wasAdded = collectionsStore.addLikedCollection(props.collection.id);
      if (!wasAdded) {
        return;
      }
      collectionsStore.adjustLikeCount(props.collection.id, 1, props.collection.likeCount);
      const { success } = await COLLECTIONS_API_SERVICE.likeCollection(props.collection.id);
      if (!success) {
        collectionsStore.removeLikedCollection(props.collection.id);
        collectionsStore.adjustLikeCount(props.collection.id, -1, props.collection.likeCount);
        showToast('Failed to like collection', ToastTypesEnum.negative);
      } else {
        trackEvent({
          key: CollectionsEventKey.LIKE_COLLECTION,
          properties: {
            collectionId: props.collection.id,
          },
        });
        invalidateCollectionQueries();
        emit('updated', props.collection);
      }
    }
  } catch {
    // Roll back optimistic update
    if (wasLiked) {
      collectionsStore.addLikedCollection(props.collection.id);
      collectionsStore.adjustLikeCount(props.collection.id, 1, props.collection.likeCount);
    } else {
      collectionsStore.removeLikedCollection(props.collection.id);
      collectionsStore.adjustLikeCount(props.collection.id, -1, props.collection.likeCount);
    }
    showToast('Failed to update like status', ToastTypesEnum.negative);
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxLikeButton',
};
</script>
