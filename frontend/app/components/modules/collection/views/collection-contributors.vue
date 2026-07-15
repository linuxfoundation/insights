<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container py-5 lg:py-10">
    <h1 class="text-heading-3 font-secondary font-bold mb-5">Contributors</h1>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching collection contributors"
      :is-empty="isEmpty"
    >
      <lfx-table>
        <thead>
          <tr>
            <th class="text-left text-xs font-semibold text-neutral-500 py-3 px-2">Contributor</th>
            <th class="text-left text-xs font-semibold text-neutral-500 py-3 px-2">Total contributions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contributor in contributors"
            :key="contributor.id"
            class="border-t border-neutral-100"
          >
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <lfx-avatar
                  :src="contributor.avatar"
                  type="member"
                  :aria-label="contributor.displayName"
                />
                <lfx-tooltip :disabled="!contributor.githubHandleArray?.length">
                  <template
                    v-if="contributor.githubHandleArray?.length"
                    #content
                  >
                    <div class="flex flex-col gap-2">
                      <a
                        v-for="githubHandle in contributor.githubHandleArray"
                        :key="githubHandle"
                        :href="`https://github.com/${githubHandle}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-1 text-white"
                      >
                        <lfx-icon
                          name="github"
                          type="brands"
                          :size="14"
                        />
                        <span class="text-xs font-semibold">{{ githubHandle }}</span>
                      </a>
                    </div>
                  </template>
                  <span>{{ contributor.displayName }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td class="py-3 px-2">{{ formatNumber(contributor.contributionCount) }}</td>
          </tr>
        </tbody>
      </lfx-table>
    </lfx-project-load-state>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRequestFetch } from 'nuxt/app';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import LfxTable from '~/components/uikit/table/table.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';

const props = defineProps<{
  slug: string;
}>();

const requestFetch = useRequestFetch();

const { data, status, error } = COLLECTIONS_API_SERVICE.fetchCollectionContributors(props.slug, requestFetch);

const contributors = computed(() => data.value || []);
const isEmpty = computed(() => contributors.value.length === 0);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionContributorsView',
};
</script>
