<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <nuxt-link :to="{ name: LfxRoutes.COLLECTION, params: { slug: props.collection.slug } }">
    <div class="border border-neutral-200 bg-white rounded-lg flex flex-col gap-5 hover:shadow-md transition">
      <!-- header -->
      <div
        v-if="collection.imgUrl"
        class="flex items-center gap-2 h-32"
        :style="{ backgroundImage: `url(${props.collection.imgUrl})` }"
      >
        >
      </div>
      <div
        v-else
        class="flex items-center gap-2 p-4"
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
      </div>

      <!-- content -->
      <div class="p-4">
        <h3 class="text-base leading-6 font-semibold text-neutral-900 mb-1">
          {{ props.collection.name }}
        </h3>
        <p class="text-xs leading-5 text-neutral-500 line-clamp-2 mb-6">
          {{ props.collection.description }}
        </p>

        <div class="flex items-center gap-2 mb-2">
          <img
            :src="owner.logo"
            :alt="owner.name"
            class="block"
            loading="lazy"
            width="16"
            height="16"
          />
          <p class="text-xs leading-5 text-neutral-600">
            by
            {{ owner.name }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <lfx-icon
            name="laptop-code"
            :size="16"
            class="text-neutral-600"
          />
          <p
            v-if="props.collection.featuredProjects && props.collection.featuredProjects.length > 0"
            class="text-xs leading-5 text-neutral-500"
          >
            {{ props.collection.projectCount }} projects
            <span v-if="props.collection.updatedAt">
              ・ Updated {{ formatDate(props.collection.updatedAt, 'dd MMM yyyy') }}
            </span>
          </p>
        </div>

        <!-- footer -->
        <div class="pt-3 mt-3 border-t border-neutral-200 flex justify-center">
          <lfx-icon-button
            type="transparent"
            icon="share-nodes"
            @click.stop.prevent="handleShare"
          />
        </div>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection } from '~~/types/collection';
import { formatDate } from '~/components/shared/utils/formatter';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
// @ts-expect-error Vite asset import with ?url suffix
import lfIconUrl from '~/assets/images/icon.svg?url';

const router = useRouter();
const { openShareModal } = useShareStore();

const props = defineProps<{
  collection: Collection;
}>();

const headerBackground = computed(() => {
  if (props.collection.gradient) {
    return {
      backgroundImage: `linear-gradient(180deg, ${props.collection.gradient[0]}, ${props.collection.gradient[1]})`,
    };
  }
  // Default: accent-50 from 100% to 0% opacity at 0 degrees
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
</script>

<script lang="ts">
export default {
  name: 'LfxExploreCollectionCard',
};
</script>
