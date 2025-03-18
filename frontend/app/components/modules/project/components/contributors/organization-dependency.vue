<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Organization dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions across different organizations, whose contributors were actively involved in the
      project during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>

    <hr>
    <section class="mt-5">
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching organization dependency"
        :is-empty="isEmpty"
      >

        <lfx-metric-dropdown v-model="metric" />

        <lfx-dependency-display
          :top-dependency="topOrganizations"
          :other-dependency="otherOrganizations"
          :list="organizations"
          label="organization"
        >
          <lfx-avatar-group>
            <lfx-avatar
              v-for="orgAvatar in topOrganizationsAvatars"
              :key="orgAvatar.name"
              :name="orgAvatar.name"
              :src="orgAvatar.logo"
              type="organization"
              :force-background="true"
            />
          </lfx-avatar-group>
        </lfx-dependency-display>

        <div class="font-semibold mb-5 mt-8">
          <span class="text-black">Top contributors </span>
        </div>

        <lfx-organizations-table
          show-percentage
          :metric="metric"
          :organizations="organizations"
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
import LfxOrganizationsTable from './fragments/organizations-table.vue';
import type { OrganizationDependency } from '~~/types/contributors/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/fragments/metric-dropdown.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { links } from '~/config/links';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/organization-dependency`,
  {
    params: {
      metric,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const organizationDependency = computed<OrganizationDependency>(() => data.value as OrganizationDependency);
const topOrganizations = computed(() => organizationDependency.value?.topOrganizations);
const otherOrganizations = computed(() => organizationDependency.value?.otherOrganizations);
const organizations = computed(() => organizationDependency.value?.list);

const topOrganizationsAvatars = computed(() => (organizations.value?.length
  ? organizations.value.slice(0, Math.min(3, organizations.value.length))
  : []));

const isEmpty = computed(() => isEmptyData(organizations.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationDependency'
};
</script>
