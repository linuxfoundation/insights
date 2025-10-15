<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-dropdown-select
    v-if="!props.snapshot"
    v-model="activity"
    :class="props.fullWidth ? '!w-full' : '!w-auto'"
    :match-width="true"
    v-bind="$attrs"
  >
    <template #trigger="{ selectedOption }">
      <lfx-dropdown-selector
        type="filled"
        class="justify-center"
        :class="props.fullWidth ? '!w-full' : '!w-auto'"
      >
        <img
          v-if="selectedOption.platform"
          :src="getIcon(selectedOption.platform)"
          :alt="selectedOption.platform"
          class="w-4 h-4"
        >
        <lfx-icon
          v-else
          name="display-code"
          :size="16"
        />
        {{ selectedOption.label }}
      </lfx-dropdown-selector>
    </template>

    <lfx-dropdown-item
      :value="defaultAllValue"
      label="All activities"
    />

    <lfx-dropdown-separator v-if="connected.length > 0" />

    <template
      v-for="group in platformsWithActivityTypes"
      :key="group.key"
    >
      <template v-if="connected.includes(group.key) && group.activityTypes.length > 0">
        <lfx-dropdown-group-title>
          {{ group.label }}
        </lfx-dropdown-group-title>

        <lfx-dropdown-item
          v-for="option of group.activityTypes"
          :key="option.key"
          :value="`${group.key}:${option.key}`"
          :label="option.label"
          :platform="group.key"
        >
          <img
            v-if="group.image"
            :src="group.image"
            class="w-4 h-4"
          >
          {{ option.label }}
        </lfx-dropdown-item>
      </template>
    </template>
  </lfx-dropdown-select>
  <div
    v-else
    class="flex items-center gap-2"
  >
    <img
      v-if="selected.platform !== 'all'"
      :src="getIcon(selected?.platform!)"
      class="w-4 h-4"
    >
    <lfx-icon
      v-else
      name="display-code"
      :size="16"
    />
    <p class="text-sm font-medium">
      {{ selected.label || 'All activities' }}
      {{ includeCollaborations ? ' and collaborations' : '' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuery, type QueryFunction } from '@tanstack/vue-query';
import LfxDropdownSelector from '~/components/uikit/dropdown/dropdown-selector.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxDropdownGroupTitle from '~/components/uikit/dropdown/dropdown-group-title.vue';
import LfxDropdownItem from '~/components/uikit/dropdown/dropdown-item.vue';
import LfxDropdownSelect from '~/components/uikit/dropdown/dropdown-select.vue';
import LfxDropdownSeparator from '~/components/uikit/dropdown/dropdown-separator.vue';
import { platforms } from '~~/app/config/platforms';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import type { ActivityTypeItem, ActivityTypesByPlatformResponse } from '~~/types/development/responses.types';
import { TanstackKey } from '~/components/shared/types/tanstack';

const props = withDefaults(defineProps<{
  modelValue: string;
  fullWidth?: boolean
  snapshot?: boolean;
  includeCollaborations?: boolean;
  includeOtherContributions?: boolean;
}>(), {
  fullWidth: true,
  snapshot: false,
});

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();
const defaultAllValue = 'all:all';

const { project } = storeToRefs(useProjectStore());

const projectSlug = computed(() => project.value?.slug || '');

const queryKey = computed(() => [
  TanstackKey.ACTIVITY_TYPES,
  projectSlug.value,
  props.includeCollaborations,
  props.includeOtherContributions,
]);

const queryFn = computed<QueryFunction<ActivityTypesByPlatformResponse>>(() => {
  // Capture values at the time the function is created
  const slug = projectSlug.value;
  const includeCollabs = props.includeCollaborations ?? false;
  const includeOther = props.includeOtherContributions ?? false;

  return async () => {
    if (!slug) {
      return {};
    }

    const params = new URLSearchParams();
    params.set('includeCodeContributions', String(true));
    params.set('includeCollaborations', String(includeCollabs));
    params.set('includeOtherContributions', String(includeOther));

    const result = await $fetch<ActivityTypesByPlatformResponse>(
      `/api/project/${slug}/activity-types?${params.toString()}`
    );
    return result;
  };
});

const enabledState = computed(() => {
  const enabled = !!projectSlug.value;
  return enabled;
});

const queryResult = useQuery<ActivityTypesByPlatformResponse>({
  queryKey,
  queryFn,
  enabled: enabledState,
  placeholderData: {},
});

const { data: activityTypesData } = queryResult;

const connected = computed(() => {
  const platformList = (project.value?.connectedPlatforms || [])
      .map((platform) => platform.split('-').at(0) || platform);
  return [...new Set(platformList)];
})

// Build platforms list with corresponding activity types and their labels, from Tinybird data.
const platformsWithActivityTypes = computed(() => {
  if (!activityTypesData.value) return [];

  return Object.entries(activityTypesData.value).map(([platformKey, activityTypes]) => ({
    key: platformKey,
    label: platforms[platformKey]?.label || platformKey,
    image: platforms[platformKey]?.image,
    activityTypes,
  }));
});

const activity = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const getIcon = (platform: string) => platforms[platform]?.image || '';

const options = computed<ActivityTypeItem[]>(() =>
  platformsWithActivityTypes.value.flatMap((p) => p.activityTypes)
);

const selected = computed(() => {
  const [platform, type] = activity.value.split(':');
  const option = options.value.find((option) => option.key === type);
  return {
    platform,
    label: option?.label || '',
  }
})

</script>

<script lang="ts">
export default {
  name: 'LfxActivitiesDropdown'
};
</script>
