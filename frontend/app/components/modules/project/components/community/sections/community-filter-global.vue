<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-community-filter-modal v-if="isCommunityFilterOpen" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCommunityStore } from '~/components/modules/project/components/community/store/community.store';
import LfxCommunityFilterModal from '~/components/modules/project/components/community/sections/community-filter-modal.vue';

const { isCommunityFilterOpen } = storeToRefs(useCommunityStore());
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityFilterGlobal',
};
</script>
