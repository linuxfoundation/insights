<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="org-cta">
      <div class="org-cta-icon">
        <lfx-icon
          name="users"
          :size="24"
          class="org-cta-icon-inner"
        />
      </div>
      <div class="org-cta-content">
        <h3 class="font-semibold org-cta-title">Working at {{ orgDisplayName }}?</h3>
        <p class="org-cta-description">
          Go to LFX Org Lens to get person-level insights about your open source contributions.
        </p>
      </div>
      <a
        href="https://myorg.lfx.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="org-cta-action"
      >
        <lfx-button
          type="primary"
          label="Open Org Lens"
          icon="external-link"
          icon-position="right"
        />
      </a>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useOrganizationPageStore } from '~/components/modules/organization/store/organization-page.store';

const { organization } = storeToRefs(useOrganizationPageStore());
const orgDisplayName = computed(() => organization.value?.displayName || 'this organization');
</script>

<script lang="ts">
export default {
  name: 'LfxOrgLockedContributorsSection',
};
</script>

<style lang="scss" scoped>
.org-cta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}

.org-cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
  background-color: #ebf5ff;
  flex-shrink: 0;
}

.org-cta-icon-inner {
  font-size: 1.5rem;
  color: #0094ff;
}

.org-cta-content {
  flex: 1;
}

.org-cta-title {
  font-size: 1rem;
  color: #0f172a;
}

.org-cta-description {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.375rem;
}

.org-cta-action {
  flex-shrink: 0;
}
</style>
