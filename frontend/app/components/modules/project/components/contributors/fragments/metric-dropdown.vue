<template>
  <lfx-dropdown-select
    v-model="metric"
    class="!w-full"
    :match-width="true"
  >
    <template #trigger="{selectedOption}">
      <lfx-dropdown-selector
        type="filled"
        class="w-full justify-center"
      >
        <img
          v-if="selectedOption.platform"
          :src="getIcon(selectedOption.platform)"
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
      value="all:all"
      label="All activities"
    />

    <lfx-dropdown-separator />

    <template
      v-for="group of metricsOptions"
      :key="group.label"
    >
      <lfx-dropdown-group-title>
        {{group.label}}
      </lfx-dropdown-group-title>

      <lfx-dropdown-item
        v-for="option of group.items"
        :key="option.value"
        :value="`${group.label.toLowerCase()}:${option.value}`"
        :label="option.label"
        :platform="group.label.toLowerCase()"
      >
        <img
          v-if="getIcon(group.label.toLowerCase())"
          :src="getIcon(group.label.toLowerCase())"
          class="w-4 h-4"
        >
        {{option.label}}
      </lfx-dropdown-item>
    </template>
  </lfx-dropdown-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { metricsOptions, activityPlatformsIcons } from '../config/metrics';
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownGroupTitle from "~/components/uikit/dropdown/dropdown-group-title.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";

const props = defineProps<{
  modelValue: string;
  maxWidth?: string;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const metric = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const getIcon = (platform: string) => (platform !== 'all' ? activityPlatformsIcons[platform?.toString() ?? ''] : '');
</script>

<script lang="ts">
export default {
  name: 'LfxMetricDropdown'
};
</script>
