<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<template>
  <lfx-card
    class="border border-neutral-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
  >
    <div class="flex flex-col md:gap-5 gap-3">
      <slot>
        <!-- Header Section -->
        <lfx-community-card-header :mention="mention" />

        <!-- Content Section -->
        <lfx-community-card-content :mention="mention" />

        <!-- Relevance Comment Section -->
        <lfx-community-card-footer :mention="mention" />
      </slot>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
// Default card display component for community mentions
import LfxCommunityCardHeader from '../fragments/card-header.vue';
import LfxCommunityCardContent from '../fragments/card-content.vue';
import LfxCommunityCardFooter from '../fragments/card-footer.vue';
import type { CommunityMentions } from '~~/types/community/community';
import LfxCard from '~/components/uikit/card/card.vue';

defineProps<{
  mention: CommunityMentions;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityDefaultCard',
};
</script>
