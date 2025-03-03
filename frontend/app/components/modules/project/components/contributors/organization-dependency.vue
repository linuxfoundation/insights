<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Organization dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions by different organizations to the project. A project is at risk
      if only a few organizations are responsible for a large portion of the total activities.
    </p>

    <hr>
    <section class="mt-5">
      <div class="min-h-[500px]">
        <div
          v-if="status === 'pending'"
          class="flex justify-center items-center h-full"
        >
          <lfx-spinner />
        </div>
        <div
          v-else-if="status === 'error'"
          class="flex justify-center items-center h-full"
        >
          <!-- <lfx-error-message /> -->
          <!-- TODO: Need to define an empty or error state here -->
        </div>
        <template v-else>
          <lfx-metric-dropdown v-model="metric" />

          <lfx-dependency-display
            :top-dependency="topOrganizations"
            :other-dependency="otherOrganizations"
            :list="organizations"
            label="organizations"
          >
            <lfx-avatar-group>
              <lfx-avatar
                v-for="orgAvatar in topOrganizationsAvatars"
                :key="orgAvatar.name"
                :name="orgAvatar.name"
                :src="orgAvatar.logo"
                type="organization"
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
        </template>
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useFetch } from 'nuxt/app';
import {storeToRefs} from "pinia";
import LfxDependencyDisplay from './fragments/dependency-display.vue';
import LfxOrganizationsTable from './fragments/organizations-table.vue';
import type { OrganizationDependency } from './types/contributors.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/fragments/metric-dropdown.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const { showToast } = useToastService();
const {startDate, endDate} = storeToRefs(useProjectStore())

const route = useRoute();
const metric = ref('all');
const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/contributors/organization-dependency`,
    {
      params: {
        metric: metric.value,
        repository: route.params.name || '',
        startDate,
        endDate,
      }
    }
);

const topOrganizations = computed(() => (data.value as OrganizationDependency)?.topOrganizations);
const otherOrganizations = computed(
  () => (data.value as OrganizationDependency)?.otherOrganizations
);
const organizations = computed(() => (data.value as OrganizationDependency)?.list);

const topOrganizationsAvatars = computed(() => (organizations.value?.length
    ? organizations.value.slice(0, Math.min(3, organizations.value.length))
    : []));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching contributor dependency: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectOrganizationDependency'
};
</script>
