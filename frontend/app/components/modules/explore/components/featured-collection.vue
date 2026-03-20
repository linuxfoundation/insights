<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-section
    type="curated"
    :status="curatedStatus"
    :error="curatedError"
    error-message="Error fetching featured collections"
    :is-empty="isCuratedEmpty"
  >
    <lfx-collection-card
      v-for="collection in curatedCollections"
      :key="collection.slug"
      :collection="collection"
      variant="curated"
    />
  </lfx-collection-section>

  <div class="pt-10 border-t border-neutral-200">
    <lfx-collection-section
      type="community"
      :status="communityStatus"
      :error="communityError"
      error-message="Error fetching community collections"
      :is-empty="isCommunityEmpty"
    >
      <lfx-collection-card
        v-for="collection in communityCollections"
        :key="collection.slug"
        :collection="collection"
        variant="community"
      />
    </lfx-collection-section>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxCollectionSection from '~/components/shared/components/collection-section.vue';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const { user } = storeToRefs(useAuthStore());

const {
  data: curatedData,
  status: curatedStatus,
  error: curatedError,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCuratedCollections();

const {
  data: communityData,
  status: communityStatus,
  error: communityError,
  refetch,
} = COLLECTIONS_API_SERVICE.fetchDiscoveryCommunityCollections(user.value);

const curatedCollections = computed(() => curatedData.value?.data || []);
const communityCollections = computed(() => communityData.value?.data || []);

const isCuratedEmpty = computed(() => COLLECTIONS_API_SERVICE.isEmptyData(curatedCollections.value));
const isCommunityEmpty = computed(() => COLLECTIONS_API_SERVICE.isEmptyData(communityCollections.value));

watch(user, () => {
  refetch();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection',
};
</script>
