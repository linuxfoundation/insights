<template>
  <lfx-dropdown
    v-model="value"
    :options="options"
    icon="fa-buildings fa-light"
    type="filled"
    dropdown-position="left"
    :prefix="pageWidth < 640 ? undefined : 'Industry'"
    placeholder="All"
    :split-lines="[1]"
  />
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useFetch} from "nuxt/app";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";
import type {DropdownGroupOptions} from "~/components/uikit/dropdown/types/dropdown.types";
import useResponsive from "~/components/shared/utils/responsive";

const props = defineProps<{
  modelValue: string;
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>();

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const {pageWidth} = useResponsive();

const options = computed<DropdownGroupOptions[]>(() => [
  {
    label: '',
    items: [
      {
        label: 'All industries',
        value: ''
      },
    ]
  },
  ...(data.value || []),
])

const { data } = useFetch<DropdownGroupOptions>(
    () => `/api/collection/industry`
);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilterIndustry'
};
</script>
