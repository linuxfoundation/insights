<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center gap-6 py-8">
    <div class="flex-1 h-px bg-neutral-200" />

    <div class="flex flex-col items-center text-center gap-1.5 max-w-lg">
      <p class="font-semibold text-neutral-900">Working at {{ orgDisplayName }}?</p>
      <p class="text-sm text-neutral-500">Get person-level insights about your open source contributions.</p>
      <a
        href="https://myorg.lfx.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="no-underline mt-1"
      >
        <lfx-button
          type="transparent"
          button-style="pill"
          size="medium"
        >
          <span class="sm:hidden">Open in LFX Self-Serve</span>
          <span class="hidden sm:inline">Check your organization data in LFX Self-Serve</span>
          <lfx-icon
            name="arrow-up-right-from-square"
            :size="12"
          />
        </lfx-button>
      </a>
    </div>

    <div class="flex-1 h-px bg-neutral-200" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'your organization');
</script>

<script lang="ts">
export default {
  name: 'LfxOrgLockedContributorsSection',
};
</script>
