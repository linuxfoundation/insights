<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="org-header-outer">
    <section class="container">
      <div class="org-header-inner">
        <div class="org-header-top">
          <lfx-back>
            <lfx-icon-button
              type="transparent"
              icon="angle-left"
            />
          </lfx-back>
          <lfx-organization-logo
            :src="props.organization?.logo || ''"
            size="large"
            :alt="props.organization?.displayName"
            class="org-header-logo"
          />
          <div class="org-header-info">
            <div class="org-header-name-row">
              <h1 class="text-heading-4 font-bold font-secondary org-header-name">
                {{ props.organization?.displayName }}
              </h1>
              <a
                v-if="props.organization?.membershipTier"
                href="https://www.linuxfoundation.org/about/members"
                target="_blank"
                rel="noopener noreferrer"
                class="org-tier-badge"
                :class="tierClass"
              >
                <img
                  src="~/assets/images/icon.svg"
                  alt="LF"
                  class="org-tier-lf-icon"
                />
                {{
                  props.organization.membershipTier.charAt(0).toUpperCase() + props.organization.membershipTier.slice(1)
                }}
                Member
              </a>
            </div>
            <p
              v-if="props.organization?.description"
              class="org-header-description"
            >
              {{ props.organization?.description }}
            </p>
          </div>
        </div>
        <div
          v-if="hasMetadata"
          class="org-header-meta"
        >
          <lfx-tag
            v-if="props.organization?.employeeCount"
            size="small"
          >
            {{ employeeRange }} employees
          </lfx-tag>
          <lfx-tag
            v-if="props.organization?.industry"
            size="small"
          >
            {{ props.organization.industry }}
          </lfx-tag>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OrganizationProfile } from '~~/types/organization-page';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxBack from '~/components/uikit/back/back.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';

const props = defineProps<{
  organization: OrganizationProfile | undefined;
}>();

const employeeRange = computed(() => {
  const count = props.organization?.employeeCount;
  if (!count) return '';
  if (count <= 10) return '1-10';
  if (count <= 50) return '11-50';
  if (count <= 200) return '51-200';
  if (count <= 500) return '201-500';
  if (count <= 1000) return '501-1,000';
  if (count <= 5000) return '1,001-5,000';
  if (count <= 10000) return '5,001-10,000';
  return '10,001+';
});

const hasMetadata = computed(
  () => props.organization?.domain || props.organization?.employeeCount || props.organization?.industry,
);

const tierClass = computed(() => {
  switch (props.organization?.membershipTier) {
    case 'platinum':
      return 'org-tier-platinum';
    case 'gold':
      return 'org-tier-gold';
    case 'silver':
      return 'org-tier-silver';
    default:
      return '';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxOrgHeader',
};
</script>

<style lang="scss" scoped>
.org-header-outer {
  background-color: #fff;
  outline: 1px solid #e2e8f0;
}

.org-header-inner {
  padding: 0.75rem 0;

  @media (min-width: 1024px) {
    padding: 1.5rem 0;
  }
}

.org-header-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.org-header-logo {
  margin-right: 0.25rem;
}

.org-header-info {
  min-width: 0;
}

.org-header-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.org-header-name {
  white-space: nowrap;
}

.org-header-description {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  max-width: 48rem;
}

.org-header-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-left: 3.5rem;
  flex-wrap: wrap;
}

.org-header-website {
  font-size: 0.875rem;
  color: #0094ff;
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: #006dbe;
  }
}

.org-header-website-icon {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.org-tier-badge {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.org-tier-lf-icon {
  width: 14px;
  height: 14px;
  display: block;
}

.org-tier-platinum {
  background-color: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.org-tier-gold {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.org-tier-silver {
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}
</style>
