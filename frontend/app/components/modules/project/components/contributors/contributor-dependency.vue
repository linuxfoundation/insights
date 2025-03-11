<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributor dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions among different contributors, highlighting key individuals who
      are actively involved in the project.
    </p>

    <hr>
    <section class="mt-5">
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching contributor dependency"
        :is-empty="isEmpty"
        :height="400"
        use-min-height
      >
        <lfx-metric-dropdown v-model="metric" />

        <lfx-dependency-display
          :top-dependency="topContributors"
          :other-dependency="otherContributors"
          :list="contributors"
          label="contributors"
        >
          <lfx-avatar-group>
            <lfx-avatar
              v-for="avatar in contributorsAvatars"
              :key="avatar.name"
              :name="avatar.name"
              :src="avatar.avatar"
              type="member"
            />
          </lfx-avatar-group>
        </lfx-dependency-display>

        <div class="font-semibold mb-5 mt-8">
          <span class="text-black">Top contributors </span>
        </div>

        <lfx-contributors-table
          show-percentage
          :metric="metric"
          :contributors="contributors"
        />
      </lfx-project-load-state>

    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useFetch } from 'nuxt/app';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxDependencyDisplay from './fragments/dependency-display.vue';
import LfxContributorsTable from './fragments/contributors-table.vue';
import type { ContributorDependency } from './types/contributors.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/fragments/metric-dropdown.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/contributor-dependency`,
  {
    params: {
      metric,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const topContributors = computed(() => (data.value as ContributorDependency)?.topContributors);
const otherContributors = computed(() => (data.value as ContributorDependency)?.otherContributors);
const contributors = computed(() => (data.value as ContributorDependency)?.list);

const contributorsAvatars = computed(() => (contributors.value?.length
  ? contributors.value.slice(0, Math.min(5, topContributors.value.count))
  : []));

const isEmpty = computed(() => isEmptyData(contributors.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributorDependency'
};
</script>
