<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="!bg-neutral-100 rounded-lg border !border-neutral-200">
    <div class="-m-px border border-neutral-200 rounded-lg p-6 bg-white">
      <div class="flex justify-between items-center pb-5 border-b border-neutral-100">
        <div class="flex items-center gap-3">
          <lfx-avatar
            :src="data?.logo"
            type="organization"
            size="normal"
            :aria-label="data?.logo && data?.name"
          />
          <p class="text-sm leading-5 font-semibold">
            {{ data?.name }}
            <span
              v-if="repositoryGroup && selectedRepositoryGroup"
              class="font-normal"
              >&nbsp;/ {{ selectedRepositoryGroup?.name }}</span
            >
            <span
              v-else-if="repoName"
              class="font-normal"
              >&nbsp;/ {{ repoName }}</span
            >
          </p>
        </div>
        <div class="text-body-2 text-neutral-500 flex items-center gap-1">
          <lfx-icon
            name="calendar"
            :size="14"
          />
          <p v-if="startDate && endDate">
            {{ DateTime.fromFormat(startDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
            → {{ DateTime.fromFormat(endDate, 'yyyy-MM-dd').toFormat('MMM d, yyyy') }}
          </p>
          <p v-else>All time</p>
        </div>
      </div>
      <div class="pt-5">
        <h2
          v-if="config?.name"
          class="text-heading-2 font-bold font-secondary"
        >
          {{ config?.name }}
        </h2>
      </div>
      <component
        :is="config?.component"
        v-if="config?.component"
        :snapshot="true"
        :model-value="params"
      />
    </div>
    <a
      href="https://insights.linuxfoundation.org"
      target="_blank"
      class="block"
    >
      <div class="pt-2 pb-1 flex justify-center gap-3 items-center">
        <p class="text-xs leading-5 text-neutral-500">Powered by</p>
        <img
          src="~/assets/images/logo.svg"
          alt="LFX Insights"
          class="h-3.5"
          loading="lazy"
          width="88"
          height="14"
        />
      </div>
    </a>
  </lfx-card>
</template>

<script lang="ts" setup>
import { computed, onServerPrefetch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { DateTime } from 'luxon';
import { storeToRefs } from 'pinia';
import { lfxWidgets, type WidgetConfig } from '~/components/modules/widget/config/widget.config';
import type { Widget } from '~/components/modules/widget/types/widget';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Project } from '~~/types/project';
import { PROJECT_API_SERVICE } from '~/components/modules/project/services/project.api.service';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { dateOptKeys } from '~/components/modules/project/config/date-options';

const route = useRoute();
const { slug } = route.params;
const { widget, startDate, endDate, timeRangeKey, repos, repositoryGroup, ...params } = route.query;

const {
  startDate: startDateStore,
  endDate: endDateStore,
  selectedTimeRangeKey,
  selectedRepositoryGroup,
  project,
} = storeToRefs(useProjectStore());

const config: WidgetConfig = lfxWidgets[widget as Widget];

// Fetch project
const queryKey = computed(() => [TanstackKey.PROJECT, slug]);

const { data, suspense } = useQuery<Project>({
  queryKey,
  queryFn: PROJECT_API_SERVICE.fetchProject(slug as string),
  retry: false,
});

const repositories = computed(() => repos?.split('|') || []);

const repoName = computed(() => {
  if (repositories.value?.length === 1) {
    const [repoSlug] = repositories.value;
    const repo = data.value?.repositories.find((repo) => repo.slug === repoSlug);
    return repo?.name?.split('/').at(-1) || '';
  }
  if (repositories.value?.length > 1) {
    return `${repositories.value.length} repositories`;
  }
  return '';
});

onServerPrefetch(async () => {
  await suspense();
  project.value = data.value as Project;
});

startDateStore.value = startDate as string;
endDateStore.value = endDate as string;
selectedTimeRangeKey.value = (timeRangeKey as string) || dateOptKeys.past365days;
</script>

<script lang="ts">
export default {
  name: 'LfxWidgetEmbed',
};
</script>
