<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="overflow-x-auto">
    <lfx-table class="min-w-[640px]">
      <thead>
        <tr>
          <th>Organization</th>
          <th class="text-right">Contributors</th>
          <th class="text-right">In {{ countryName }}</th>
          <th class="text-right">Contributions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="organization in organizations"
          :key="organization.id"
        >
          <td>
            <div class="flex items-center gap-2">
              <lfx-organization-logo
                :src="organization.logo || undefined"
                :alt="organization.displayName"
                size="small"
              />
              <nuxt-link
                v-if="organization.slug"
                :to="{ name: LfxRoutes.ORGANIZATION, params: { orgSlug: organization.slug } }"
                class="font-medium text-neutral-900 hover:underline"
              >
                {{ organization.displayName }}
              </nuxt-link>
              <span
                v-else
                class="font-medium text-neutral-900"
              >
                {{ organization.displayName }}
              </span>
              <lfx-tag
                v-if="organization.headquarteredInCountry"
                variation="info"
                size="small"
              >
                {{ countryCode }}
              </lfx-tag>
            </div>
          </td>
          <td class="text-right font-semibold">{{ formatNumber(organization.contributorCount) }}</td>
          <td class="text-right text-neutral-600">{{ formatNumber(organization.contributorInCountryCount) }}</td>
          <td class="text-right">{{ formatNumber(organization.contributionCount) }}</td>
        </tr>
      </tbody>
    </lfx-table>
  </div>
</template>

<script setup lang="ts">
import { LfxRoutes } from '~/components/shared/types/routes';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxOrganizationLogo from '~/components/uikit/organization-logo/organization-logo.vue';
import LfxTable from '~/components/uikit/table/table.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import type { CncfCountryOrganization } from '~~/types/report/cncf-country.types';

defineProps<{
  organizations: CncfCountryOrganization[];
  countryCode: string;
  countryName: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryOrganizations',
};
</script>
