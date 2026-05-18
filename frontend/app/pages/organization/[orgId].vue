<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-org-header :organization="data" />
  <div>
    <div v-if="isLoading || data">
      <nuxt-page />
    </div>
    <div
      v-else-if="!isLoading && !data"
      class="w-full flex justify-center py-20 text-neutral-500 text-sm"
    >
      Organization not found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { createError, showError, useRoute } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import { computed, onServerPrefetch, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { OrganizationProfile } from '~~/types/organization-page';
import LfxOrgHeader from '~/components/modules/organization/components/header.vue';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { ORGANIZATION_PAGE_API_SERVICE } from '~/components/modules/organization/services/organization-page.api.service';

const route = useRoute();
const { orgId } = route.params;
const { organization, isOrganizationLoading } = storeToRefs(useOrganizationPageStore());

const queryKey = computed(() => [TanstackKey.ORGANIZATION_PAGE, orgId]);

const { isLoading, data, suspense, isError, error } = useQuery<OrganizationProfile>({
  queryKey,
  queryFn: ORGANIZATION_PAGE_API_SERVICE.fetchProfile(orgId as string),
  retry: false,
});

onServerPrefetch(async () => {
  await suspense();
  if (isError.value) {
    const statusMessage = error.value?.message || 'Organization Not Found';

    if (import.meta.server) {
      throw createError({ statusCode: 404, statusMessage });
    } else {
      showError({ statusCode: 404, statusMessage });
    }
  }
  if (data.value) {
    organization.value = data.value;
  }
});

watch(
  () => data.value,
  (value) => {
    if (value) {
      organization.value = value;
    }
  },
  { immediate: true },
);

watch(
  () => isLoading.value,
  (value) => {
    isOrganizationLoading.value = value;
  },
  { immediate: true },
);
</script>
