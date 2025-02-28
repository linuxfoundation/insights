<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Contributor dependency</h3>
    <p class="text-body-2 text-neutral-500 mb-5">
      Distribution of contributions among different contributors, highlighting key individuals who
      are actively involved in the project.
    </p>

    <hr>
    <section class="mt-5">
      <div class="min-h-[500px]">
        <div v-if="status === 'pending'" class="flex justify-center items-center h-full">
          <lfx-spinner />
        </div>
        <div v-else-if="status === 'error'" class="flex justify-center items-center h-full">
          <!-- <lfx-error-message /> -->
          <!-- TODO: Need to define an empty or error state here -->
        </div>
        <template v-else>
          <lfx-metric-dropdown v-model="metric" />

          <lfx-dependency-display
            :top-dependency="topContributors"
            :other-dependency="otherContributors"
            :list="contributors"
            label="contributors">
            <lfx-avatar-group>
              <lfx-avatar
                v-for="avatar in contributorsAvatars"
                :key="avatar.name"
                :name="avatar.name"
                :src="avatar.avatar"
                type="member" />
            </lfx-avatar-group>
          </lfx-dependency-display>

          <div class="font-semibold mb-5 mt-8">
            <span class="text-black">Top contributors </span>
            <span class="text-neutral-400"> over the {{ timePeriodLabel }} </span>
          </div>

          <lfx-contributors-table show-percentage :metric="metric" :contributors="contributors" />
        </template>
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useFetch } from 'nuxt/app';
import LfxDependencyDisplay from './fragments/dependency-display.vue';
import LfxContributorsTable from './fragments/contributors-table.vue';
import type { ContributorDependency } from './types/contributors.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxMetricDropdown from '~/components/modules/project/components/contributors/fragments/metric-dropdown.vue';
import LfxAvatarGroup from '~/components/uikit/avatar-group/avatar-group.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { timePeriodsOptions } from '~/components/shared/config/time-periods';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);
const { showToast } = useToastService();

const route = useRoute();
const metric = ref('all');
const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/contributors/contributor-dependency`,
    {
      params: {
        metric: metric.value,
        repository: route.params.name || '',
        'time-period': props.timePeriod
      }
    }
);

const topContributors = computed(() => (data.value as ContributorDependency)?.topContributors);
const otherContributors = computed(() => (data.value as ContributorDependency)?.otherContributors);
const contributors = computed(() => (data.value as ContributorDependency)?.list);

const contributorsAvatars = computed(() => (contributors.value?.length
    ? contributors.value.slice(0, Math.min(5, topContributors.value.count))
    : []));

const timePeriodLabel = computed(() => (
    timePeriodsOptions.find((option) => option.value === props.timePeriod)?.label || ''
  ).toLowerCase());

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
  name: 'LfxProjectContributorDependency'
};
</script>
