<template>
  <lfx-dropdown-select
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
      v-for="group of platforms"
      :key="group.key"
    >
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
  </lfx-dropdown-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxDropdownGroupTitle from "~/components/uikit/dropdown/dropdown-group-title.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxDropdownSeparator from "~/components/uikit/dropdown/dropdown-separator.vue";
import { platforms } from '~~/app/config/platforms';

const props = withDefaults(defineProps<{
  modelValue: string;
  fullWidth: boolean
}>(), {
  fullWidth: true
});

const emit = defineEmits<{(e: 'update:modelValue', value: string): void }>();

const activity = computed({
  get() {
    return props.modelValue;
  },
  set(value: string) {
    emit('update:modelValue', value);
  }
});

const getIcon = (platform: string) => {
  const platformArr = Object.values(platforms);
  return (platform !== 'all' ? platformArr.find((p) => p.key === platform)?.image : '')
};
</script>

<script lang="ts">
export default {
  name: 'LfxActivitiesDropdown'
};
</script>
