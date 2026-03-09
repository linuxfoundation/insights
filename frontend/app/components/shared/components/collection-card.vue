<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }">
    <lfx-card class="!shadow-none !rounded-xl !border-neutral-200 flex flex-col hover:!shadow-md transition h-full">
      <!-- header: cover image for curated collections -->
      <div
        v-if="props.collection.coverImgUrl && props.variant === 'curated'"
        class="flex items-center gap-2 h-[120px] rounded-t-xl bg-cover bg-center"
        :style="{ backgroundImage: `url(${props.collection.coverImgUrl})` }"
      ></div>
      <!-- header: avatar stack for community/my-collections or curated without cover image -->
      <div
        v-else
        class="flex items-center gap-2 p-4 min-h-16 rounded-t-xl"
        :class="{ 'justify-between': props.variant === 'my-collections' }"
        :style="headerBackground"
      >
        <lfx-avatar-group type="project">
          <lfx-avatar
            v-for="project of props.collection.featuredProjects.slice(0, 5)"
            :key="project.slug"
            :src="project.logo"
            type="project"
            :aria-label="project.logo && project.name"
          />
        </lfx-avatar-group>
        <lfx-icon-button
          v-if="props.variant === 'my-collections'"
          type="transparent"
          icon="ellipsis"
          size="small"
          class="!text-neutral-900"
          @click.stop.prevent="handleOptionsMenu"
        />
      </div>

      <!-- content -->
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-base leading-6 font-semibold text-neutral-900 mb-1 truncate">
          {{ props.collection.name }}
        </h3>
        <p class="text-xs leading-4 text-neutral-500 line-clamp-2 mb-6">
          {{ props.collection.description }}
        </p>

        <div class="mt-auto">
          <!-- owner info - different display based on variant -->
          <div
            v-if="props.variant !== 'my-collections'"
            class="flex items-center gap-2 mb-2"
          >
            <template v-if="props.variant === 'community' && props.collection.owner?.logo">
              <lfx-avatar
                :src="props.collection.owner.logo"
                type="member"
                size="small"
              />
            </template>
            <template v-else>
              <img
                :src="owner.logo"
                :alt="owner.name"
                class="block"
                loading="lazy"
                width="12"
                height="12"
              />
            </template>
            <p class="text-xs leading-4 text-neutral-600">by {{ owner.name }}</p>
          </div>

          <!-- project count and updated date -->
          <div class="flex items-center gap-1.5">
            <lfx-icon
              name="laptop-code"
              :size="12"
              class="text-neutral-500"
            />
            <p
              v-if="props.collection.projectCount && props.collection.projectCount > 0"
              class="text-xs leading-4 text-neutral-500"
            >
              {{ props.collection.projectCount }} projects
              <span v-if="props.collection.updatedAt">
                ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM') }}
              </span>
              <template v-if="props.variant === 'my-collections'"> ・ </template>
            </p>
            <!-- visibility badge for my-collections -->
            <span
              v-if="props.variant === 'my-collections'"
              class="flex items-center gap-1.5"
            >
              <lfx-icon
                :name="props.collection.isPrivate ? 'lock' : 'globe'"
                :size="12"
                :class="props.collection.isPrivate ? 'text-neutral-900' : 'text-accent-500'"
              />
              <span
                class="text-xs leading-4 font-medium"
                :class="props.collection.isPrivate ? 'text-neutral-900' : 'text-accent-500'"
              >
                {{ props.collection.isPrivate ? 'Private' : 'Public' }}
              </span>
            </span>
          </div>

          <!-- footer actions - not shown for my-collections -->
          <div
            v-if="props.variant !== 'my-collections'"
            class="pt-3 mt-3 border-t border-neutral-200 flex items-center gap-2"
          >
            <lfx-button
              type="transparent"
              class="opacity-50 hover:!opacity-100 w-1/3 flex justify-center items-center hover:!bg-transparent"
              @click.stop.prevent="handleShare"
            >
              <lfx-icon
                name="share-nodes"
                :size="16"
                class="!text-neutral-900"
              />
            </lfx-button>
            <lfx-button
              type="transparent"
              class="opacity-50 hover:!opacity-100 w-1/3 flex justify-center items-center hover:!bg-transparent"
              @click.stop.prevent="handleClone"
            >
              <lfx-icon
                name="clone"
                :size="16"
                class="!text-neutral-900"
              />
            </lfx-button>
            <lfx-button
              type="transparent"
              class="w-1/3 flex justify-center items-center hover:!bg-transparent"
              :class="props.collection.isLiked ? 'opacity-100' : 'opacity-50 hover:!opacity-100'"
              @click.stop.prevent="handleLike"
            >
              <lfx-icon
                name="heart"
                :size="16"
                :class="props.collection.isLiked ? '!text-negative-500' : 'text-neutral-900'"
                :type="props.collection.isLiked ? 'solid' : 'light'"
              />
              <span
                v-if="props.collection.likeCount !== undefined"
                class="text-xs leading-4 text-neutral-900 font-medium"
              >
                {{ props.collection.likeCount }}
              </span>
            </lfx-button>
          </div>
        </div>
      </div>
    </lfx-card>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection, CollectionType } from '~~/types/collection';
import { formatDate } from '~/components/shared/utils/formatter';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import LfxCard from '~/components/uikit/card/card.vue';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';

const router = useRouter();
const { openShareModal } = useShareStore();

const props = withDefaults(
  defineProps<{
    collection: Collection;
    variant?: CollectionType;
  }>(),
  {
    variant: 'curated',
  },
);

const headerBackground = computed(() => {
  if (props.collection.gradient) {
    return {
      backgroundImage: `linear-gradient(180deg, ${props.collection.gradient[0]}, ${props.collection.gradient[1]})`,
    };
  }
  return {
    backgroundImage: 'linear-gradient(180deg, rgba(248, 251, 255, 1), rgba(248, 251, 255, 0))',
  };
});

const owner = computed(() => {
  if (props.collection.owner) {
    return {
      name: props.collection.owner?.name,
      logo: props.collection.owner?.logo,
    };
  }

  return {
    name: 'The Linux Foundation',
    logo: lfIconUrl,
  };
});

const handleShare = () => {
  const title = `LFX Insights | Collections - ${props.collection.name}`;

  const resolvedRoute = router.resolve({
    name: LfxRoutes.COLLECTION,
    params: { slug: props.collection.slug },
  });
  const url = new URL(resolvedRoute.href, window.location.origin);

  openShareModal({
    url: url.toString(),
    title,
    area: props.collection.name,
  });
};

const handleClone = () => {
  // TODO: Implement clone functionality
};

const handleLike = () => {
  // TODO: Implement like functionality
};

const handleOptionsMenu = () => {
  // TODO: Implement options menu for my-collections
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionCard',
};
</script>
