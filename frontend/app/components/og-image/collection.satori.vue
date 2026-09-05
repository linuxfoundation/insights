<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <!-- Curated Collection Layout - no ssoUserId, shows collection logo -->
  <div
    v-if="!isCommunity"
    style="width: 1200px; height: 630px; position: relative; display: flex"
  >
    <img
      src="/images/og-image/bg.png"
      alt=""
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    />

    <!-- COLLECTION Label -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        width: 720px;
        font-family: 'Inter', sans-serif;
        font-size: 20px;
        font-weight: 400;
        color: #002648;
        letter-spacing: 10px;
        line-height: 32px;
      "
    >
      COLLECTION
    </div>

    <!-- Collection Name -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 136px;
        width: 720px;
        height: 80px;
        font-family: 'Roboto Slab', serif;
        font-size: 64px;
        font-weight: 300;
        line-height: 80px;
        color: #0f172a;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      "
    >
      {{ safeName }}
    </div>

    <!-- Description -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 240px;
        width: 720px;
        height: 80px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 36px;
        color: #0f172a;
        overflow: hidden;
      "
    >
      {{ safeDescription }}
    </div>

    <!-- Collection Logo -->
    <div
      style="
        position: absolute;
        left: 920px;
        top: 80px;
        width: 200px;
        height: 200px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        v-if="collectionLogo"
        :src="collectionLogo"
        alt=""
        :width="200"
        :height="200"
        :style="{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
        }"
      />
    </div>

    <!-- LFX Insights Logo -->
    <img
      src="/images/og-image/lfx-insights-logo.png"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>

  <!-- Community Collection Layout - has ssoUserId, shows project logos -->
  <div
    v-else
    style="width: 1200px; height: 630px; position: relative; display: flex"
  >
    <img
      src="/images/og-image/bg.png"
      alt=""
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    />

    <!-- COLLECTION Label -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 80px;
        width: 780px;
        font-family: 'Inter', sans-serif;
        font-size: 20px;
        font-weight: 400;
        color: #002648;
        letter-spacing: 10px;
        line-height: 32px;
      "
    >
      COLLECTION
    </div>

    <!-- Collection Name -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 136px;
        width: 780px;
        height: 80px;
        font-family: 'Roboto Slab', serif;
        font-size: 64px;
        font-weight: 300;
        line-height: 80px;
        color: #0f172a;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      "
    >
      {{ safeName }}
    </div>

    <!-- Description -->
    <div
      style="
        position: absolute;
        left: 80px;
        top: 240px;
        width: 780px;
        height: 80px;
        font-family: 'Inter', sans-serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 36px;
        color: #0f172a;
        overflow: hidden;
      "
    >
      {{ safeDescription }}
    </div>

    <!-- Project Logos Stack (rendered bottom-to-top so first logo is on top in SVG stacking) -->
    <img
      v-for="(item, index) in reversedProjectLogos"
      :key="index"
      :src="item"
      alt=""
      :width="130"
      :height="130"
      :style="{
        position: 'absolute',
        left: '980px',
        top: `${85 + (reversedProjectLogos.length - 1 - index) * 116}px`,
        width: '130px',
        height: '130px',
        borderRadius: '65px',
        border: '5px solid white',
        objectFit: 'cover',
      }"
    />

    <!-- LFX Insights Logo -->
    <img
      src="/images/og-image/lfx-insights-logo.png"
      alt="LFX Insights"
      style="position: absolute; left: 80px; top: 472px; width: 352px; height: 48px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Collection } from '~~/types/collection';

const props = withDefaults(
  defineProps<{
    collectionSlug?: string;
  }>(),
  {
    collectionSlug: '',
  },
);

// Fetch collection data directly in the OG component
const { data: collection } = props.collectionSlug
  ? await useFetch<Collection>(`/api/collection/${props.collectionSlug}`, {
      key: `og-collection-${props.collectionSlug}`,
      default: () => null as unknown as Collection,
    })
  : { data: ref(null as unknown as Collection) };

// Strip emojis and other problematic unicode characters that can crash resvg
const stripEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      '',
    )
    .trim();
};

// Community collections have an ssoUserId (created by a user)
const isCommunity = computed(() => !!collection.value?.ssoUserId);
const collectionLogo = computed(() => collection.value?.logoUrl || '');

const safeName = computed(() => stripEmojis(collection.value?.name || ''));

const safeDescription = computed(() => {
  const desc = stripEmojis(collection.value?.description || '');
  const maxLength = 150;
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength).trim() + '...';
});

const projectLogos = computed(() => {
  if (!collection.value?.featuredProjects) return [];
  return collection.value.featuredProjects
    .slice(0, 5)
    .map((p) => p.logo)
    .filter(Boolean);
});

// Reversed so first logo renders last in DOM (appears on top in SVG stacking order)
const reversedProjectLogos = computed(() => [...projectLogos.value].reverse());
</script>
