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
      v-for="group in platforms"
      :key="group.key"
    >
      <template v-if="connected.includes(group.key)">
        <lfx-dropdown-group-title>
          {{ group.label }}
        </lfx-dropdown-group-title>

        <lfx-dropdown-item
          v-for="option of filterActivityTypes(group.activityTypes)"
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
import { computed, watch } from 'vue';
import {storeToRefs} from "pinia";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownGroupTitle from "~/components/uikit/dropdown/dropdown-group-title.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import { platforms } from '~~/app/config/platforms';
import {useProjectStore} from "~/components/modules/project/store/project.store";
import type {ActivityType} from "~~/types/shared/platforms.types";

const props = withDefaults(defineProps<{
  modelValue: string;
  fullWidth?: boolean
  snapshot?: boolean;
  includeCollaborations?: boolean;
}>(), {
  fullWidth: true,
  snapshot: false,
});

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();
const defaultAllValue = 'all:all';

const { project } = storeToRefs(useProjectStore());

const connected = computed(() => {
  const platformList = (project.value?.connectedPlatforms || [])
      .map((platform) => platform.split('-').at(0) || platform);
  return [...new Set(platformList)];
})

const activity = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const getIcon = (platform: string) => platforms[platform]?.image || '';

const options = computed<ActivityType[]>(() => Object.values(platforms).map((p) => p.activityTypes).flat());

const selected = computed(() => {
  const [platform, type] = activity.value.split(':');
  const option = options.value.find((option) => option.key === type);
  return {
    platform,
    label: option?.label || '',
  }
})

/**
 * Filter activity types based on the property includeCollaborations.
 * If includeCollaborations is true, return all activity types.
 * If includeCollaborations is false, return only non-collaboration types (where isCollaborationType is false or undefined).
 * @param activityTypes 
 */
const filterActivityTypes = (activityTypes: ActivityType[]) => {
  if (props.includeCollaborations) {
    return activityTypes;
  }
  return activityTypes.filter((activityType) => !activityType.isCollaborationType);
}

/**
 * Watch for the includeCollaborations property and update the activity types accordingly.
 * If the current activity type is not included in the filtered activity types, update the activity type to the defaultAllValue.
 */
watch(() => props.includeCollaborations, (newVal: boolean) => {
  const filteredActivityTypes = Object.values(platforms)
    .filter((platform) => connected.value.includes(platform.key))
    .flatMap((platform) =>
      platform.activityTypes
        .filter((activityType) => !activityType.isCollaborationType)
        .map((activityType) => `${platform.key}:${activityType.key}`)
    );
  if (activity.value !== defaultAllValue && !newVal && !filteredActivityTypes.includes(activity.value)) {
    activity.value = defaultAllValue;
  }
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxActivitiesDropdown'
};
</script>
