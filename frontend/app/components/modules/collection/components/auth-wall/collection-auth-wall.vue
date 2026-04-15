<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isOpen"
    width="40rem"
  >
    <template #default="{ close }">
      <div
        class="bg-gradient-to-t from-white from-50% to-accent-100 rounded-xl shadow-xl border border-neutral-100 p-8 flex flex-col gap-16 overflow-hidden"
      >
        <!-- Top section -->
        <div class="flex flex-col gap-10">
          <!-- Header: Members only badge + close button -->
          <div class="flex flex-col gap-10">
            <div class="flex items-start justify-between">
              <span class="bg-neutral-600 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <lfx-icon
                  name="lock"
                  :size="12"
                  class="text-white"
                />
                <span class="text-white text-xs font-semibold">Members only</span>
              </span>
              <lfx-icon-button
                icon="xmark"
                type="outline"
                size="small"
                @click="close"
              />
            </div>

            <!-- Title + description -->
            <div class="flex flex-col gap-3">
              <h2 class="font-secondary font-light text-3xl leading-[44px]">
                <span class="text-neutral-900 font-secondary">Your open source universe,</span>
                <br />
                <span class="text-accent-500 font-secondary">curated your way.</span>
              </h2>
              <p class="text-sm leading-5 text-neutral-900">
                Sign in to build, customize, and save collections of the open source projects that matter to you. Then
                watch your community discover and celebrate them.
              </p>
            </div>
          </div>

          <!-- Three feature columns -->
          <div class="flex gap-8">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="flex-1 flex flex-col gap-4"
            >
              <lfx-icon
                :name="feature.icon"
                :size="16"
                :class="feature.iconClass"
              />
              <div class="flex flex-col gap-1">
                <span class="text-sm font-semibold text-neutral-900 leading-5">{{ feature.title }}</span>
                <span class="text-xs text-neutral-600 leading-4">{{ feature.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom section -->
        <div class="flex flex-col gap-10 items-center">
          <!-- Social proof (shown only when at least 3 community collection authors exist) -->
          <div
            v-if="topAuthors.length >= 3"
            class="flex items-center gap-3"
          >
            <lfx-avatar-group type="member">
              <lfx-avatar
                v-for="author in topAuthors"
                :key="author.name"
                type="member"
                size="small"
                :src="author.logo"
              />
            </lfx-avatar-group>
            <span class="text-xs text-neutral-900"
              >Join a growing community of contributors already curating on LFX Insights</span
            >
          </div>

          <!-- CTA buttons -->
          <div class="flex gap-5 items-center w-full">
            <lfx-button
              type="primary"
              button-style="pill"
              class="flex-1 justify-center"
              @click="handleSignIn"
            >
              Sign in to LFX
            </lfx-button>
            <lfx-button
              type="outline"
              button-style="pill"
              class="flex-1 justify-center"
              @click="handleSignIn"
            >
              Create account
            </lfx-button>
          </div>
        </div>
      </div>
    </template>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import { useAuth } from '~~/composables/useAuth';
import type { Collection } from '~~/types/collection';
import type { Pagination } from '~~/types/shared/pagination';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const { login } = useAuth();

type Author = { name: string; logo: string };

const topAuthorsCache = ref<Author[] | null>(null);
let topAuthorsPromise: Promise<Author[]> | null = null;

const topAuthors = ref<Author[]>(topAuthorsCache.value ?? []);

const fetchTopAuthors = async (): Promise<Author[]> => {
  if (topAuthorsCache.value) return topAuthorsCache.value;
  if (!topAuthorsPromise) {
    topAuthorsPromise = $fetch<Pagination<Collection>>('/api/collection', {
      params: { type: 'community', sort: 'likeCount_desc', pageSize: 10 },
    })
      .then((data) => {
        const seen = new Set<string>();
        const authors: Author[] = [];
        for (const collection of data.data) {
          if (collection.owner?.name && !seen.has(collection.owner.name)) {
            seen.add(collection.owner.name);
            authors.push(collection.owner);
            if (authors.length >= 3) break;
          }
        }
        topAuthorsCache.value = authors;
        return authors;
      })
      .catch(() => {
        topAuthorsPromise = null;
        return [];
      });
  }
  return topAuthorsPromise;
};

onMounted(async () => {
  topAuthors.value = await fetchTopAuthors();
});

const features = [
  {
    icon: 'rectangle-history-circle-plus',
    iconClass: 'text-accent-500',
    title: 'Create collections',
    description: 'Group projects by theme, stack, or use case. Give your collection a story worth sharing.',
  },
  {
    icon: 'clone',
    iconClass: 'text-discovery-500',
    title: 'Duplicate & remix',
    description: 'Fork any community collection as your own starting point and make it uniquely yours.',
  },
  {
    icon: 'heart',
    iconClass: 'text-negative-500',
    title: 'Like & save',
    description: 'Bookmark collections you love and surface them later. Your personal discovery feed awaits.',
  },
];

const handleSignIn = () => {
  login();
};
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionAuthWall',
};
</script>
