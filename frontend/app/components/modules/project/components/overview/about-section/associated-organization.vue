<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching associated organization"
    >
      <div class="p-5 flex flex-col gap-4">
        <div class="text-neutral-400 font-semibold">
          About
        </div>
        <div class="flex flex-col gap-2">
          <lfx-avatar
            :src="organization.logo"
            type="organization"
          />
          <div class="text-neutral-900 font-medium text-sm mt-1">
            {{ organization.name }}
          </div>
          <div class="text-neutral-500 text-xs">
            {{ organization.description }}
          </div>
        </div>
        <div class="flex flex-row gap-2">
          <lfx-icon name="location-dot" />
          <div class="text-neutral-900 text-xs">
            {{ organization.address }}
          </div>
        </div>
        <div class="flex flex-row gap-2">
          <lfx-icon name="users" />
          <div class="text-neutral-900 text-xs">
            {{ organization.employees }}
          </div>
        </div>
        <div class="flex flex-row gap-2">
          <lfx-icon name="building" />
          <div class="text-neutral-900 text-xs">
            {{ organization.organizationType }}
          </div>
        </div>
        <a
          :href="organization.website"
          target="_blank"
          class="flex flex-row gap-2"
        >
          <lfx-icon name="link" />
          <div class="text-neutral-900 text-xs">
            {{ organization.website }}
          </div>
        </a>
      </div>
    </lfx-project-load-state>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'nuxt/app';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import type { Organization } from '~~/types/contributors/responses.types';
import { OVERVIEW_API_SERVICE } from '~~/app/components/modules/project/services/overview.api.service';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';

const route = useRoute();

const params = computed(() => ({
  projectSlug: route.params.slug as string
}));

const {
  data,
  status,
  error
} = OVERVIEW_API_SERVICE.fetchAssociatedOrganization(params);

const organization = computed<Organization>(() => data.value as Organization);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
